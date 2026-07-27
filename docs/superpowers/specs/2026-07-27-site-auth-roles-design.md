# 全站登录与角色权限设计

## 目标

用全站统一登录替换档案馆页内嵌登录；登录用户分为超级管理员与普通用户。普通用户不能看到「档案馆」Tab，也不能访问档案馆/工作台或写站点数据；超管保留现有管理能力。

## 决策摘要

| 项 | 选择 |
|---|---|
| 登录范围 | 全站强制登录；未登录仅可访问 `/login`（及静态资源 / auth 回调） |
| 角色 | `super_admin` / `user` |
| 账号来源 | 仅在 Supabase 后台手工创建；无站内注册 |
| 角色存储 | `public.profiles.role`（代码读角色） |
| 权限模型 | 超管可读可写 + 档案馆/工作台；普通用户只读公开页 |
| 越权访问 | 未登录 → `/login`；已登录非超管 → 无权限提示 |
| 鉴权落地 | Middleware + Server Action/`requireSuperAdmin` + RLS 收紧 |
| 登录 UI | 统一 `/login`；删除档案馆/工作台内嵌 `LoginForm` 墙 |

## 范围

包含：

1. `profiles` 表、新建用户 trigger、超管角色手工赋值流程。
2. Next.js middleware 全站 session 闸门与 `/login` 放行。
3. 全站登录页、登出入口；移除知识库/工作室 页内嵌登录墙。
4. 导航按角色过滤「档案馆」；页脚与移动端同步。
5. `requireSuperAdmin` 替换「`requireOwner` ≡ 已登录」；写操作与 `/knowledge*`、`/studio` 超管校验。
6. RLS：站点表写策略改为仅超管；档案馆相关写权限与超管专属对齐。
7. 普通用户隐藏/禁用写操作 UI（新增、编辑、删除、拖拽排序等）。

不包含：

- 站内注册、邀请、角色管理 UI
- OAuth / 魔法链接 / 第三方登录
- 多租户或「每人一套档案馆」
- 匿名可浏览的营销落地页（本轮以全站强制登录为准）

## 信息架构与路由

### 角色能力

| 角色 | 导航 | 页面 | 数据 |
|------|------|------|------|
| 未登录 | — | 仅 `/login` | 无 |
| `user` | 庭院 / 归档 / 草本集 / 园主（无「档案馆」）；次级：技能工坊、资源 | 上述只读；直进 `/knowledge*`、`/studio` → 无权限页 | 不可写 |
| `super_admin` | 全量 Tab（含档案馆） | 全站可读可写；档案馆、工作台可用 | 可写 |

### 路由行为

1. 未登录访问任意受保护路径 → 重定向 `/login?next=…`
2. 已登录访问 `/login` → 重定向首页（或合法 `next`）
3. `user` 访问 `/knowledge*`、`/studio` → 站点壳内「无权限访问」+ 回首页（不静默重定向）
4. 登录成功默认落点 `/`；`next` 必须是站内相对路径，且对该角色可访问，否则回首页（拒绝开放重定向）
5. 两角色顶栏均提供登出；登出后进入 `/login`

## 数据模型

### `public.profiles`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | uuid PK | `= auth.users.id` |
| `role` | text not null | `'super_admin' \| 'user'`，默认 `'user'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

- `auth.users` 插入后由 trigger 自动创建 `profiles` 行，`role = 'user'`
- 超管：在 Supabase Table Editor / SQL 将对应行改为 `super_admin`
- 无 `profiles` 行：视为未授权（不默认提权、不默认给写权限）

### 运维约定

1. Dashboard 创建 Auth 用户（邮箱+密码）
2. 确认 `profiles` 已自动生成
3. 需要超管时执行：`update profiles set role = 'super_admin' where id = '<uid>'`

## 鉴权分层

1. **Middleware**：校验 session；无 session → `/login`；放行 `/login`、静态资源、必要的 auth callback
2. **`getSessionUser()`**：返回 `user` + `profile.role`（或等价结构）
3. **`requireAuthenticatedUser()`**：有 session 即可（只读场景）
4. **`requireSuperAdmin()`**：`role === 'super_admin'`；否则明确错误；替换现有「已登录即 Owner」
5. **RLS**：站点写策略改为  
   `EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')`  
   `kb_records` 等档案馆表：管理读写仅 `super_admin`（普通用户不可经 PostgREST 读写；页面层亦不可进 `/knowledge*`）

登录实现继续使用 Supabase `signInWithPassword`（邮箱+密码）。

## UI

### `/login`

- 复用现有 SpiritGarden 登录表单风格（邮箱、密码）
- 错误用 state + `sg-*-error`，禁止 `alert`
- 无注册入口
- 成功：`router.refresh()` + 跳转合法 `next` 或 `/`

### 导航与壳

- 按角色生成主 Tab：`user` 去掉「档案馆」；页脚 / 抽屉同步
- 顶栏用户区：简短标识（如邮箱）+「登出」
- 登出：`signOut()` → `/login`

### 无权限与写控件

- `/knowledge*`、`/studio` 对 `user`：无权限页文案 + 回首页链接
- 写操作控件仅 `super_admin` 可见/可用（含项目增删改、拖拽排序、工作台等）
- Server Action / API 越权：返回明确错误，前端内联展示

### 迁移

- 删除 `knowledge/page.tsx`、`studio/page.tsx` 内嵌登录墙
- `LoginForm` 迁为全站 `/login` 使用（可保留组件路径或挪到共享 auth 目录）

## 错误处理

| 场景 | 行为 |
|------|------|
| 登录失败 | 表单内错误（可统一为「邮箱或密码错误」） |
| 无 session 写接口 | 401 /「请先登录」 |
| 非超管写或进档案馆·工作台 | 403 / 无权限页或内联错误 |
| profiles 缺失 | 当未授权处理；可提示联系管理员 |
| RLS 拒绝 | Action 捕获后友好文案，不暴露底层细节 |

## 测试与验证

1. 未登录访问 `/` → `/login`
2. `user` 登录后顶栏无「档案馆」；直开 `/knowledge` → 无权限
3. `super_admin` 可见档案馆并可 CRUD
4. `user` 调用写 Action → 失败且数据不变
5. 登出后无法继续访问受保护页
6. `pnpm typecheck` / 相关 lint / 必要 unit 或 e2e

## 成功标准

- 访客无法匿名浏览站点
- 普通用户无档案馆 Tab，无法进入档案馆/工作台，无法写数据
- 超管一次登录即可管理全站与档案馆
- 档案馆页内嵌登录已移除

## 与现状关系

- 复用：Supabase Auth、`LoginForm` 交互、`requireAuthenticatedUser` 骨架
- 改变：全站闸门、角色模型、导航过滤、Owner 语义、RLS 写策略、登出 UI
- 废弃：档案馆/工作室 页级登录墙；「任意 authenticated = 站主」假设
