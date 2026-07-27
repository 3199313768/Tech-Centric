# 全站登录与角色权限 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全站强制登录；`super_admin` 可写并访问档案馆/工作台；`user` 只读公开页且无「档案馆」Tab；移除档案馆页内嵌登录。

**Architecture:** `profiles.role` 存角色；Next.js middleware 拦无 session；Server 读 profile 驱动导航与闸门；写操作与 RLS 统一收成超管；`/login` 为唯一登录入口。

**Tech Stack:** Next.js App Router、`@supabase/ssr` middleware、Supabase Auth + RLS、Vitest、现有 SpiritGarden UI。

**Spec:** `docs/superpowers/specs/2026-07-27-site-auth-roles-design.md`

---

## File map

| 文件 | 职责 |
|------|------|
| `scripts/sql/setup-profiles.sql` | `profiles` 表、trigger、RLS 读策略 |
| `scripts/sql/patch-super-admin-write.sql` | 站点表 + `kb_records` 写策略改为仅超管 |
| `src/lib/auth/roles.ts` | `SiteRole` 类型与纯函数（导航过滤、路径合法性、`next` 校验） |
| `src/lib/auth/roles.test.ts` | 上述纯函数单测 |
| `src/lib/auth/getSessionProfile.ts` | Server：user + profile.role |
| `src/lib/auth/requireUser.ts` | 保留；新增 `requireSuperAdmin` |
| `src/lib/auth/apiRequireUser.ts` | 新增 `requireApiSuperAdmin` |
| `src/lib/supabase/middleware.ts` | Cookie session 刷新（供 root middleware 调用） |
| `src/middleware.ts` | 无 session → `/login`；已登录访问 `/login` → 首页/`next` |
| `src/app/login/page.tsx` | 全站登录页 |
| `src/components/auth/LoginForm.tsx` | 从 knowledge 迁出并改文案/跳转（或 re-export） |
| `src/components/auth/ForbiddenPanel.tsx` | 无权限 UI |
| `src/components/auth/NavUserMenu.tsx` | 邮箱 + 登出 |
| `src/components/home/shell/Navigation.tsx` | 按 role 过滤 Tab；挂用户菜单 |
| `src/components/knowledge/shell/KnowledgeNav.tsx` | 同上 |
| `src/components/home/shell/SiteFooter.tsx` | 页脚 Tab 按 role 过滤（若复用 `SITE_NAV_TABS`） |
| `src/app/(site)/layout.tsx` | Server 取 profile，传给 shell/nav |
| `src/app/(knowledge)/layout.tsx` | 同上 |
| `src/app/(knowledge)/knowledge/page.tsx` | 去 LoginForm；非超管 → Forbidden |
| `src/app/(knowledge)/knowledge/[id]/page.tsx` | 非超管 → Forbidden（与 `/knowledge*` 一致） |
| `src/app/(site)/studio/page.tsx` | 去 LoginForm；非超管 → Forbidden |
| `src/lib/{projects,skills,vibe,resources,studio,knowledge}/actions.ts` | 写操作改 `requireSuperAdmin` |
| `src/app/(site)/projects/page.tsx` 等 | 传 `canManage` / `canReorder` 仅超管 |
| 各列表 UI | 写按钮仅 `canManage` |

---

### Task 1: 角色纯函数 + 单测

**Files:**
- Create: `src/lib/auth/roles.ts`
- Create: `src/lib/auth/roles.test.ts`

- [ ] **Step 1: 写失败单测**

```ts
import { describe, expect, it } from 'vitest'
import {
  SITE_ROLE,
  getMainNavTabsForRole,
  isSuperAdminPath,
  isSafeNextPath,
  resolvePostLoginPath,
} from '@/lib/auth/roles'
import { SITE_ROUTES } from '@/lib/site/routes'

describe('getMainNavTabsForRole', () => {
  it('hides knowledge for user', () => {
    const hrefs = getMainNavTabsForRole(SITE_ROLE.user).map((t) => t.href)
    expect(hrefs).not.toContain(SITE_ROUTES.knowledge)
    expect(hrefs).toContain(SITE_ROUTES.home)
  })

  it('includes knowledge for super_admin', () => {
    const hrefs = getMainNavTabsForRole(SITE_ROLE.super_admin).map((t) => t.href)
    expect(hrefs).toContain(SITE_ROUTES.knowledge)
  })
})

describe('isSuperAdminPath', () => {
  it('matches knowledge and studio', () => {
    expect(isSuperAdminPath('/knowledge')).toBe(true)
    expect(isSuperAdminPath('/knowledge/abc')).toBe(true)
    expect(isSuperAdminPath('/studio')).toBe(true)
    expect(isSuperAdminPath('/projects')).toBe(false)
  })
})

describe('isSafeNextPath / resolvePostLoginPath', () => {
  it('rejects open redirects', () => {
    expect(isSafeNextPath('https://evil.com')).toBe(false)
    expect(isSafeNextPath('//evil.com')).toBe(false)
    expect(isSafeNextPath('/projects')).toBe(true)
  })

  it('blocks user from admin next', () => {
    expect(resolvePostLoginPath('/knowledge', SITE_ROLE.user)).toBe('/')
    expect(resolvePostLoginPath('/knowledge', SITE_ROLE.super_admin)).toBe('/knowledge')
  })
})
```

- [ ] **Step 2: 跑测确认失败**

Run: `pnpm test:unit src/lib/auth/roles.test.ts`

Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 `roles.ts`**

```ts
import { SITE_NAV_TABS, SITE_ROUTES } from '@/lib/site/routes'

export const SITE_ROLE = {
  super_admin: 'super_admin',
  user: 'user',
} as const

export type SiteRole = (typeof SITE_ROLE)[keyof typeof SITE_ROLE]

export function isSiteRole(value: string | null | undefined): value is SiteRole {
  return value === SITE_ROLE.super_admin || value === SITE_ROLE.user
}

export function getMainNavTabsForRole(role: SiteRole) {
  if (role === SITE_ROLE.super_admin) return [...SITE_NAV_TABS]
  return SITE_NAV_TABS.filter((tab) => tab.href !== SITE_ROUTES.knowledge)
}

export function isSuperAdminPath(pathname: string): boolean {
  return (
    pathname === SITE_ROUTES.knowledge ||
    pathname.startsWith(`${SITE_ROUTES.knowledge}/`) ||
    pathname === SITE_ROUTES.studio ||
    pathname.startsWith(`${SITE_ROUTES.studio}/`)
  )
}

export function isSafeNextPath(next: string | null | undefined): next is string {
  if (!next || !next.startsWith('/')) return false
  if (next.startsWith('//')) return false
  if (next.includes('://')) return false
  return true
}

export function resolvePostLoginPath(
  next: string | null | undefined,
  role: SiteRole,
): string {
  if (!isSafeNextPath(next)) return SITE_ROUTES.home
  if (isSuperAdminPath(next) && role !== SITE_ROLE.super_admin) {
    return SITE_ROUTES.home
  }
  return next
}
```

- [ ] **Step 4: 跑测确认通过**

Run: `pnpm test:unit src/lib/auth/roles.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/roles.ts src/lib/auth/roles.test.ts
git commit -m "$(cat <<'EOF'
test(auth): add role nav and next-path helpers

EOF
)"
```

---

### Task 2: profiles 表 + 超管写 RLS

**Files:**
- Create: `scripts/sql/setup-profiles.sql`
- Create: `scripts/sql/patch-super-admin-write.sql`

- [ ] **Step 1: 写 `setup-profiles.sql`**

```sql
-- profiles: auth.users 1:1，默认 role = user
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('super_admin', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 禁止客户端自改 role：无 UPDATE/INSERT policy 给 authenticated
-- 角色仅 service role / Dashboard SQL 修改

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 回填已有用户
INSERT INTO public.profiles (id, role)
SELECT id, 'user' FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

- [ ] **Step 2: 写 `patch-super-admin-write.sql`**

用同一 helper 表达式替换 `patch-owner-auth-write.sql` 中各表写策略，并为 `kb_records` 收紧：

```sql
-- 示例（每张表：DROP 旧 authenticated 全写策略后重建）
-- USING / WITH CHECK:
-- EXISTS (
--   SELECT 1 FROM public.profiles p
--   WHERE p.id = auth.uid() AND p.role = 'super_admin'
-- )

-- all_projects / projects / vibe_coding / ai_skills / resources：同上

-- kb_records：替换 "Only owner can manage records"
DROP POLICY IF EXISTS "Only owner can manage records" ON public.kb_records;
CREATE POLICY "Super admins can manage kb_records"
  ON public.kb_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- 若仍有匿名/认证 SELECT 公开记录策略（is_public），按现有 patch-phase-a 保留只读策略，勿误删
```

对 `all_projects`、`projects`、`vibe_coding`、`ai_skills`、`resources` 完整写出 DROP+CREATE（镜像 `patch-owner-auth-write.sql` 结构，条件改为超管 EXISTS）。

- [ ] **Step 3: 在目标 Supabase 项目执行两份 SQL**

用 Dashboard SQL Editor 或 MCP `apply_migration` / `execute_sql`。执行后把站主账号升为超管：

```sql
UPDATE public.profiles
SET role = 'super_admin', updated_at = NOW()
WHERE id = '<站主 auth.users.id>';
```

- [ ] **Step 4: Commit SQL 文件**

```bash
git add scripts/sql/setup-profiles.sql scripts/sql/patch-super-admin-write.sql
git commit -m "$(cat <<'EOF'
chore(sql): add profiles and super-admin write RLS

EOF
)"
```

---

### Task 3: Session profile + requireSuperAdmin

**Files:**
- Create: `src/lib/auth/getSessionProfile.ts`
- Modify: `src/lib/auth/requireUser.ts`
- Modify: `src/lib/auth/apiRequireUser.ts`

- [ ] **Step 1: 实现 `getSessionProfile.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { isSiteRole, type SiteRole } from '@/lib/auth/roles'

export type SessionProfile = {
  user: User
  role: SiteRole
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data || !isSiteRole(data.role)) return null
  return { user, role: data.role }
}

export async function getSessionRole(): Promise<SiteRole | null> {
  const profile = await getSessionProfile()
  return profile?.role ?? null
}
```

- [ ] **Step 2: 扩展 `requireUser.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { SITE_ROLE } from '@/lib/auth/roles'

export async function requireAuthenticatedUser(): Promise<{
  user: User | null
  error: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: '请先登录' }
  }

  return { user, error: null }
}

export async function requireSuperAdmin(): Promise<{
  user: User | null
  error: string | null
}> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { user: null, error: '请先登录' }
  }
  if (profile.role !== SITE_ROLE.super_admin) {
    return { user: profile.user, error: '无权限' }
  }
  return { user: profile.user, error: null }
}
```

- [ ] **Step 3: 扩展 `apiRequireUser.ts`**

新增：

```ts
export async function requireApiSuperAdmin(): Promise<
  { user: User; response: null } | { user: null; response: NextResponse }
> {
  const profile = await getSessionProfile()
  if (!profile) {
    return {
      user: null,
      response: NextResponse.json({ error: '请先登录' }, { status: 401 }),
    }
  }
  if (profile.role !== SITE_ROLE.super_admin) {
    return {
      user: null,
      response: NextResponse.json({ error: '无权限' }, { status: 403 }),
    }
  }
  return { user: profile.user, response: null }
}
```

需要写权限的 API route（如 `resources` autofill/explore 若要求登录）改为 `requireApiSuperAdmin`；纯健康检查可保持登录即可。对照 `src/app/api/resources/**` 现有用法逐个改。

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth/getSessionProfile.ts src/lib/auth/requireUser.ts src/lib/auth/apiRequireUser.ts
git commit -m "$(cat <<'EOF'
feat(auth): load profiles role and requireSuperAdmin

EOF
)"
```

---

### Task 4: Middleware 全站闸门

**Files:**
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: 实现 session 刷新 helper**

`src/lib/supabase/middleware.ts`（按 `@supabase/ssr` 官方 Next.js middleware 模式）：

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabaseResponse, user: null }
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
```

- [ ] **Step 2: 实现 `src/middleware.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isSafeNextPath } from '@/lib/auth/roles'
import { SITE_ROUTES } from '@/lib/site/routes'

const PUBLIC_PREFIXES = ['/login', '/auth'] // auth callback 预留

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  const { supabaseResponse, user } = await updateSession(request)

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const next = `${pathname}${search}`
    if (isSafeNextPath(next)) url.searchParams.set('next', next)
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const next = request.nextUrl.searchParams.get('next')
    const url = request.nextUrl.clone()
    // role 在 middleware 不查 DB（避免每请求打 profiles）；落地后再由 resolvePostLoginPath 在登录页处理
    // 已登录直开 /login：先回首页；带 next 且安全则用 next（管理员路径由登录页/目标页再拦）
    url.pathname = isSafeNextPath(next) ? next : SITE_ROUTES.home
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

说明：middleware **只做 session 有无**；超管路径的无权限页由页面层做（避免 middleware 每次查 `profiles`）。已登录用户带 `next=/knowledge` 被中间件送入后，页面再 Forbidden。

- [ ] **Step 3: 本地手动烟测**

- 清 cookie 开 `/` → 应到 `/login?next=/`
- 登录后开 `/login` → 离开登录页

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/middleware.ts src/middleware.ts
git commit -m "$(cat <<'EOF'
feat(auth): enforce site-wide login middleware

EOF
)"
```

---

### Task 5: `/login` 页 + LoginForm 迁移

**Files:**
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/app/login/page.tsx`
- Modify or delete: `src/components/knowledge/auth/LoginForm.tsx`（改为 re-export 兼容，或更新全部 import 后删除）

- [ ] **Step 1: 新 `LoginForm`**

行为：

- `signInWithPassword`
- 成功后读 `?next=`，客户端无法可靠知 role → **成功后 `router.replace(safeNext || '/')` + `router.refresh()`**；若落到超管页而角色是 user，由目标页 Forbidden（符合 spec）
- 文案改为全站：「登录 SpiritGarden」/「使用管理员下发的账号」；按钮「登录」
- 错误：统一展示「邮箱或密码错误」或保留 supabase message（优先不暴露枚举邮箱）
- `htmlFor` / `aria` 保持

`isSafeNextPath` 在客户端复用：

```ts
const params = new URLSearchParams(window.location.search)
const next = params.get('next')
router.replace(isSafeNextPath(next) ? next : '/')
router.refresh()
```

- [ ] **Step 2: `src/app/login/page.tsx`**

独立居中布局（可用 `spirit-garden-content` + 现有 `sg-kb-login-wrap`），渲染 `LoginForm`。不挂站点主导航（middleware 已保证未登录只到这里）。

- [ ] **Step 3: 旧路径兼容**

`src/components/knowledge/auth/LoginForm.tsx`：

```ts
export { LoginForm } from '@/components/auth/LoginForm'
```

或全局替换 import 后删除旧文件。

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/LoginForm.tsx src/app/login/page.tsx src/components/knowledge/auth/LoginForm.tsx
git commit -m "$(cat <<'EOF'
feat(auth): add site login page and shared LoginForm

EOF
)"
```

---

### Task 6: Forbidden + 去掉档案馆/工作台登录墙

**Files:**
- Create: `src/components/auth/ForbiddenPanel.tsx`
- Modify: `src/app/(knowledge)/knowledge/page.tsx`
- Modify: `src/app/(knowledge)/knowledge/[id]/page.tsx`
- Modify: `src/app/(site)/studio/page.tsx`

- [ ] **Step 1: `ForbiddenPanel`**

```tsx
import Link from 'next/link'
import { SITE_ROUTES } from '@/lib/site/routes'

export function ForbiddenPanel({ message = '无权限访问' }: { message?: string }) {
  return (
    <div className="spirit-garden-content sg-subpage">
      <div className="sg-kb-error" role="alert">
        <p>{message}</p>
        <Link href={SITE_ROUTES.home} className="sg-btn sg-btn--primary">
          返回首页
        </Link>
      </div>
    </div>
  )
}
```

样式类名按现有 token 微调，保持无 `alert()`。

- [ ] **Step 2: knowledge / studio 页**

模式：

```ts
const profile = await getSessionProfile()
if (!profile || profile.role !== SITE_ROLE.super_admin) {
  return <ForbiddenPanel />
}
// 继续原逻辑；knowledge 列表仍可用 profile.user.id 拉数据
```

删除所有 `LoginForm` 分支。

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/ForbiddenPanel.tsx \
  src/app/\(knowledge\)/knowledge/page.tsx \
  src/app/\(knowledge\)/knowledge/\[id\]/page.tsx \
  src/app/\(site\)/studio/page.tsx
git commit -m "$(cat <<'EOF'
feat(auth): gate knowledge and studio to super_admin

EOF
)"
```

---

### Task 7: 导航按角色 + 登出

**Files:**
- Create: `src/components/auth/NavUserMenu.tsx`
- Modify: `src/components/home/shell/Navigation.tsx`
- Modify: `src/components/knowledge/shell/KnowledgeNav.tsx`
- Modify: `src/components/home/shell/SiteShell.tsx`
- Modify: `src/app/(site)/layout.tsx`
- Modify: `src/app/(knowledge)/layout.tsx`
- Modify: `src/components/home/shell/SiteFooter.tsx`（若硬编码 `SITE_NAV_TABS`）

- [ ] **Step 1: `NavUserMenu`（client）**

Props: `email: string`

- 显示截断邮箱
- 「登出」按钮：`aria-label="登出"` → `supabase.auth.signOut()` → `router.replace('/login')` → `router.refresh()`

- [ ] **Step 2: Navigation / KnowledgeNav 接收 props**

```ts
interface NavigationProps {
  transparent?: boolean
  role: SiteRole
  email: string
}
```

内部：`const tabs = getMainNavTabsForRole(role)`，桌面与抽屉都用 `tabs`；actions 区加 `<NavUserMenu email={email} />`。

- [ ] **Step 3: Server layout 注入**

`(site)/layout.tsx` 改为 async Server Component：

```tsx
import { SiteShell } from '@/components/home/shell/SiteShell'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { redirect } from 'next/navigation'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile()
  if (!profile) redirect('/login')
  return (
    <SiteShell role={profile.role} email={profile.user.email ?? ''}>
      {children}
    </SiteShell>
  )
}
```

`SiteShell` 把 `role`/`email` 传给 `Navigation`。knowledge layout 同理传给 `KnowledgeNav`。

无 profile（有 session 但缺行）→ `redirect('/login')` 或 Forbidden；与 spec「当未授权」一致，优先登出提示：可 `redirect('/login')`。

- [ ] **Step 4: Footer**

若 `SiteFooter` 遍历 `SITE_NAV_TABS`，改为接收 `role` 或使用 `getMainNavTabsForRole`；从 shell 传入。

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/NavUserMenu.tsx \
  src/components/home/shell/Navigation.tsx \
  src/components/knowledge/shell/KnowledgeNav.tsx \
  src/components/home/shell/SiteShell.tsx \
  src/components/home/shell/SiteFooter.tsx \
  src/app/\(site\)/layout.tsx \
  src/app/\(knowledge\)/layout.tsx
git commit -m "$(cat <<'EOF'
feat(auth): role-filtered nav and logout menu

EOF
)"
```

---

### Task 8: 写操作改 requireSuperAdmin

**Files:**
- Modify: `src/lib/projects/actions.ts`（含 `reorderAllProjects`）
- Modify: `src/lib/skills/actions.ts`
- Modify: `src/lib/vibe/actions.ts`
- Modify: `src/lib/resources/actions.ts`（删除本地 `requireOwner`，改用 `requireSuperAdmin`）
- Modify: `src/lib/studio/actions.ts`
- Modify: `src/lib/knowledge/actions.ts`（`getUser` 处改为 `requireSuperAdmin`）

- [ ] **Step 1: 全局替换鉴权**

每个写 action 开头：

```ts
const { error: authError } = await requireSuperAdmin()
if (authError) return { error: authError }
```

`resources/actions.ts` 删除：

```ts
async function requireOwner() { ... }
```

- [ ] **Step 2: API routes**

`src/app/api/resources/**` 中需登录写/AI 的，改 `requireApiSuperAdmin`。

- [ ] **Step 3: Commit**

```bash
git add src/lib/projects/actions.ts src/lib/skills/actions.ts src/lib/vibe/actions.ts \
  src/lib/resources/actions.ts src/lib/studio/actions.ts src/lib/knowledge/actions.ts \
  src/app/api/resources
git commit -m "$(cat <<'EOF'
feat(auth): require super_admin for write actions

EOF
)"
```

---

### Task 9: 写 UI 仅超管可见

**Files:**
- Modify: `src/app/(site)/projects/page.tsx` — `canReorder` / 新增 `canManage` 来自 `role === super_admin`
- Modify: `src/components/home/projects/AllProjects.tsx` — 新增按钮、编辑/删除仅 `canManage`；拖拽继续 `canReorder`（二者均超管时同为 true）
- Modify: skills / vibe / resources 对应 page + 列表组件 — 统一 `canManage` prop
- 检查首页或其他入口是否链到 `/studio`：非超管隐藏工作台入口

- [ ] **Step 1: projects**

```ts
const profile = await getSessionProfile()
const canManage = profile?.role === SITE_ROLE.super_admin
return <AllProjects initialProjects={projects} canManage={canManage} canReorder={canManage} />
```

`AllProjects`：无 `canManage` 时不渲染「新增项目」、详情内编辑/删除。

- [ ] **Step 2: skills / vibe / resources**

同样模式：页面取 role → `canManage` → 隐藏新增/编辑/删除按钮。

- [ ] **Step 3: Commit**

```bash
git add src/app/\(site\)/projects/page.tsx src/components/home/projects/AllProjects.tsx \
  # + skills/vibe/resources pages & components touched
git commit -m "$(cat <<'EOF'
feat(auth): hide write controls for non-admin users

EOF
)"
```

---

### Task 10: 验证与文档勾选

- [ ] **Step 1: 自动化**

```bash
pnpm test:unit src/lib/auth/roles.test.ts
pnpm typecheck
pnpm lint
```

Expected: 全绿

- [ ] **Step 2: 手动验收（对照 spec）**

| # | 步骤 | 期望 |
|---|------|------|
| 1 | 无 cookie 访问 `/` | `/login?next=/` |
| 2 | `user` 登录 | 顶栏无「档案馆」；有登出 |
| 3 | `user` 打开 `/knowledge` | 无权限页 |
| 4 | `super_admin` 打开 `/knowledge` | 可 CRUD |
| 5 | `user` 点「新增项目」（若 UI 已藏则跳过）/ 调 action | 失败或不可见 |
| 6 | 登出 | 只能留在登录相关 |

- [ ] **Step 3: 可选 e2e**

若 `e2e/` 有归档用例依赖匿名访问，改为「先登录」或加 auth setup；至少修导致红的 spec。

- [ ] **Step 4: 最终 commit（若有修复）**

```bash
git add -A
git commit -m "$(cat <<'EOF'
test(auth): verify site login and role gates

EOF
)"
```

---

## Spec coverage checklist

| Spec 要求 | Task |
|-----------|------|
| 全站强制登录 | Task 4 |
| profiles + trigger + 手工升超管 | Task 2 |
| `/login` 统一入口、删页内登录墙 | Task 5–6 |
| user 无档案馆 Tab | Task 1 + 7 |
| user 进 knowledge/studio → 无权限 | Task 6 |
| 超管可写；user 只读 | Task 8–9 |
| RLS 仅超管写 | Task 2 |
| 登出 | Task 7 |
| `next` 安全 | Task 1 + 4–5 |
| 测试 | Task 1 + 10 |

## 执行注意

- 先跑 Task 2 SQL 并给站主账号 `super_admin`，否则本地全站登录后自己也会无写权限/进不了档案馆。
- Middleware 不查 role；角色闸门在 layout/page/action。
- 与旧设计「已登录可拖拽」冲突处以本 spec 为准：仅超管。
