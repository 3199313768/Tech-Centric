# Project Detail Section Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一改版全部项目详情页，用浅底色 surface 分区卡片强化痛点 / 贡献 / 亮点等叙事节奏，封面图仍在标题下。

**Architecture:** 仅样式层改动。`ProjectDetailView` 为正文 `section` 与联系区增加 `sg-project-detail__panel` class；`globals.css` 扩展 `.sg-project-detail*`（hero 节奏、封面弱阴影、分区卡片、actions 不套卡片）。数据模型、路由、文案不变。用源码策略单测锁定 class / CSS 约定。

**Tech Stack:** Next.js 16 App Router、React 19、SpiritGarden CSS tokens、Vitest、Playwright。

**Spec:** `docs/superpowers/specs/2026-07-27-project-detail-section-cards-design.md`

---

## File map

| 文件 | 职责 |
|---|---|
| `src/lib/projects/projectDetailLayout.test.ts` | 源码策略：组件必须带 panel class；CSS 必须含 surface 卡片规则 |
| `src/components/home/projects/ProjectDetailView.tsx` | 给正文 section / contact 加 `sg-project-detail__panel` |
| `src/app/globals.css` | `.sg-project-detail*` 布局与卡片样式 |
| `e2e/archive.spec.ts` | 仅当现有选择器被破坏时再改；默认保留 `__hero` 等断言 |

---

### Task 1: 源码策略测试（RED）

**Files:**
- Create: `src/lib/projects/projectDetailLayout.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('project detail section-card layout', () => {
  it('marks narrative sections and contact as surface panels', () => {
    const source = readSource('src/components/home/projects/ProjectDetailView.tsx')

    expect(source).toContain('sg-project-detail__panel')
    expect(source).toMatch(/className="sg-project-detail__panel"/u)
    expect(source).toMatch(
      /className="sg-project-detail__contact sg-project-detail__panel"/u,
    )
    expect(source).toContain('sg-project-detail__actions')
    expect(source).not.toMatch(
      /sg-project-detail__actions[^"]*sg-project-detail__panel/u,
    )
  })

  it('styles panels as elevated surface cards with weak borders', () => {
    const css = readSource('src/app/globals.css')

    expect(css).toContain('.sg-project-detail__panel')
    expect(css).toContain('var(--sg-surface-elevated)')
    expect(css).toContain('var(--sg-border-subtle)')
    expect(css).toContain('var(--sg-radius-lg')
    expect(css).toMatch(/\.sg-project-detail__media\s*\{[^}]*box-shadow:/u)
    expect(css).toMatch(/\.sg-project-detail__hero\s+h1\s*\{/u)
  })
})
```

- [ ] **Step 2: 跑测试确认 RED**

Run: `pnpm test:unit src/lib/projects/projectDetailLayout.test.ts`

Expected: FAIL（`ProjectDetailView` 尚无 `sg-project-detail__panel`；CSS 尚无对应规则）

- [ ] **Step 3: Commit**

```bash
git add src/lib/projects/projectDetailLayout.test.ts
git commit -m "$(cat <<'EOF'
test: add project detail section-card layout policy

EOF
)"
```

---

### Task 2: 组件 class（GREEN 前半）

**Files:**
- Modify: `src/components/home/projects/ProjectDetailView.tsx`

- [ ] **Step 1: 给正文 section 与联系区加 panel class；actions 不加**

将 `ProjectDetailView` 中正文各 `section` 改为：

```tsx
<section className="sg-project-detail__panel">
```

将联系区改为：

```tsx
<section
  className="sg-project-detail__contact sg-project-detail__panel"
  aria-labelledby="project-contact-heading"
>
```

保持不变：

- `sg-project-detail__hero` / `__media` / `__actions` 结构与字段渲染逻辑
- 空字段不渲染整块（现有条件分支）
- 内联 `whiteSpace` 样式可保留（本任务不重构）

完整目标结构（仅 class 变化；字段逻辑同现文件）：

```tsx
export function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const accent = getArchiveAccent(project.category)
  const email = personalInfo.socialLinks.email?.replace(/^mailto:/, '') ?? ''

  return (
    <article className="sg-page sg-project-detail">
      <header
        className="sg-project-detail__hero"
        style={{ ['--archive-accent' as string]: accent }}
      >
        <Link href={SITE_ROUTES.projects} className="sg-project-detail__back">
          ← 返回归档
        </Link>
        <p className="sg-project-detail__eyebrow">{project.category}</p>
        <h1>{project.name}</h1>
        {project.period ? <p className="sg-project-detail__period">{project.period}</p> : null}
        {project.role ? <p className="sg-project-detail__role">{project.role}</p> : null}
        <div className="sg-card__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="sg-tag sg-tag--platform">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {project.screenshots.length > 0 ? (
        <div className="sg-project-detail__media">
          <Image
            src={project.screenshots[0]}
            alt={`${project.name} 预览`}
            width={1200}
            height={675}
            className="sg-project-detail__img"
            priority
            sizes="(max-width: 768px) 100vw, 960px"
          />
        </div>
      ) : null}

      <div className="sg-project-detail__body">
        <section className="sg-project-detail__panel">
          <h2>业务痛点 / 核心功能</h2>
          <p>{project.description}</p>
        </section>

        <section className="sg-project-detail__panel">
          <h2>主导工作 / 核心贡献</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{project.roleAndContribution}</p>
        </section>

        {project.highlights.length > 0 ? (
          <section className="sg-project-detail__panel">
            <h2>亮点成果</h2>
            <ul className="sg-project-detail__highlights">
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {project.techStack.length > 0 ? (
          <section className="sg-project-detail__panel">
            <h2>技术栈</h2>
            <div className="sg-card__tags">
              {project.techStack.map((tech) => (
                <span key={tech} className="sg-tag">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {project.body ? (
          <section className="sg-project-detail__panel">
            <h2>详细说明</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{project.body}</p>
          </section>
        ) : null}

        <div className="sg-project-detail__actions">
          {project.isPublic ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sg-btn sg-btn--primary"
            >
              访问项目 ↗
            </a>
          ) : (
            <span className="sg-btn sg-btn--ghost" aria-live="polite">
              需内网环境访问
            </span>
          )}
        </div>

        {email ? (
          <section
            className="sg-project-detail__contact sg-project-detail__panel"
            aria-labelledby="project-contact-heading"
          >
            <h2 id="project-contact-heading">合作或内推</h2>
            <p>对这个项目感兴趣？欢迎邮件联系，或通过右下角「庭院导引」发起对话。</p>
            <a href={`mailto:${email}`} className="sg-btn sg-btn--ghost" aria-label={`发送邮件至 ${email}`}>
              联系我 · {email}
            </a>
          </section>
        ) : null}
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Commit 组件改动**

```bash
git add src/components/home/projects/ProjectDetailView.tsx
git commit -m "$(cat <<'EOF'
feat(projects): mark detail sections as surface panels

EOF
)"
```

---

### Task 3: CSS 分区卡片样式（GREEN）

**Files:**
- Modify: `src/app/globals.css`（约 `.sg-project-detail` 区块，当前 ~9146–9210 与 ~9860–9875）

- [ ] **Step 1: 替换 / 扩展项目详情样式**

在现有 `.sg-project-detail` 规则处，用下列规则替换从 `.sg-project-detail` 到 `.sg-project-detail__highlights` 的整段（保留其后的 `.sg-project-card__manage` 不动）：

```css
.sg-project-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.sg-project-detail__hero {
  padding: 2.25rem 0 1.75rem;
}

.sg-project-detail__hero h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.75rem, 3.2vw, 2.25rem);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.sg-project-detail__back {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--sg-text-muted);
  text-decoration: none;
}

.sg-project-detail__back:hover {
  color: var(--sg-accent);
}

.sg-project-detail__eyebrow {
  color: var(--sg-text-muted);
  margin: 0 0 0.5rem;
}

.sg-project-detail__period,
.sg-project-detail__role {
  color: var(--sg-text-secondary);
  margin: 0.25rem 0;
}

.sg-project-detail__media {
  margin-bottom: 1.5rem;
  border-radius: var(--sg-radius-lg, 12px);
  overflow: hidden;
  box-shadow: 0 8px 24px -12px var(--color-card-shadow);
}

.sg-project-detail__img {
  width: 100%;
  height: auto;
  display: block;
}

.sg-project-detail__body {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.sg-project-detail__panel {
  margin: 0;
  padding: 1.25rem 1.5rem;
  border-radius: var(--sg-radius-lg, 12px);
  border: 1px solid var(--sg-border-subtle);
  background: var(--sg-surface-elevated);
}

.sg-project-detail__panel h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: var(--sg-text-primary, var(--sg-ink, inherit));
}

.sg-project-detail__panel p {
  line-height: 1.7;
  color: var(--sg-text-secondary);
  margin: 0;
}

.sg-project-detail__highlights {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.65;
  color: var(--sg-text-secondary);
}

.sg-project-detail__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.25rem 0 0;
}

.sg-project-detail__contact.sg-project-detail__panel {
  margin-top: 0.25rem;
  padding-top: 1.25rem;
  border-top: none;
}
```

同时**删除或替换**文件后部旧的 `.sg-project-detail__contact` / `h2` / `p` 规则（约 9860–9875），避免与 panel 冲突。联系区标题 / 正文样式已由 `.sg-project-detail__panel h2|p` 覆盖；联系区按钮间距用：

```css
.sg-project-detail__contact .sg-btn {
  margin-top: 1rem;
}
```

放在 `.sg-project-detail__contact.sg-project-detail__panel` 规则之后即可。

删除旧的：

```css
.sg-project-detail__body section {
  margin-bottom: 1.75rem;
}

.sg-project-detail__body h2 { ... }

.sg-project-detail__body p { ... }
```

（已由 `__panel` 规则替代。）

- [ ] **Step 2: 跑策略测试确认 GREEN**

Run: `pnpm test:unit src/lib/projects/projectDetailLayout.test.ts`

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
style(projects): section-card layout for project detail

EOF
)"
```

---

### Task 4: 验证

**Files:**
- 仅在失败时修改相关文件

- [ ] **Step 1: lint + typecheck**

Run:

```bash
pnpm exec eslint src/components/home/projects/ProjectDetailView.tsx src/lib/projects/projectDetailLayout.test.ts
pnpm typecheck
```

Expected: 无新增错误

- [ ] **Step 2: 单元测试再跑**

Run: `pnpm test:unit src/lib/projects/projectDetailLayout.test.ts`

Expected: PASS

- [ ] **Step 3: e2e（有本地服务时）**

Run: `pnpm test:e2e e2e/archive.spec.ts`

Expected: A3 / A4 仍通过（依赖 `.sg-project-detail__hero`、标题文案「业务痛点 / 核心功能」「合作或内推」）。若仅因环境无数据 skip，记录即可，不改选择器。

- [ ] **Step 4: 手动目视（窄屏 + 暗色）**

打开任意 `/projects/[slug]`：

1. Hero → 封面 → 分区卡片顺序正确
2. CTA 不在卡片内
3. 联系区为同款卡片
4. 无图项目无空白媒体坑
5. 窄屏无横向溢出；暗色边框 / 正文可读

- [ ] **Step 5: 最终 diff 检查**

```bash
git diff --check
git status
```

确认改动仅限本计划文件（测试、View、CSS）；无种子 / 数据模型改动。

---

## Spec coverage checklist

| Spec 要求 | Task |
|---|---|
| 全部详情页共用新布局 | Task 2–3（共用 `ProjectDetailView`） |
| 分区叙事 surface 卡片 | Task 2 panel class + Task 3 CSS |
| 封面在标题下单张大图 + 弱阴影 | Task 3 `__media` box-shadow |
| CTA 不套卡片 | Task 1 断言 + Task 2 |
| 联系区同款卡片 | Task 2 contact+panel + Task 3 |
| 不改数据 / seed / 路由 | Task 4 diff 检查 |
| e2e 保留 `__hero` | Task 4 |
| token / 禁止 hex 新主题 | Task 3 仅用现有 var |

## Self-review notes

- 无 TBD / placeholder
- class 名全程统一 `sg-project-detail__panel`
- 旧 `__body section` / `__contact` 规则必须删除以免 specificity 冲突
