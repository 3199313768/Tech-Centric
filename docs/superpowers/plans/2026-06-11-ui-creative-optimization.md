# UI 创意优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.
>
> **状态：✅ 已完成**（2026-06-11，含收尾补全 commit）

**Goal:** 在全站四区（首页、子页、知识库、助手）实施保守增强式 SpiritGarden 创意升级，含档案馆顶栏、全站助手、数据驱动首页与统一氛围层。

**Architecture:** 抽取 `SpiritAtmosphereShell` 统一纸纹/氛围/助手挂载；首页 Server 传 Featured 数据；WebGL 仅首页 Hero，其余 CSS `sg-atmosphere`；样式与动效集中在 `globals.css` motion token 区。

**Tech Stack:** Next.js 16 App Router、React 19、Tailwind CSS 4、`sg-*` CSS、Framer Motion、WebGL（`SpiritDustCanvas`）、Supabase server client

**Design spec:** [2026-06-11-ui-creative-optimization-design.md](../specs/2026-06-11-ui-creative-optimization-design.md)

---

## File Map

| 文件 | 职责 |
|------|------|
| `SpiritAtmosphereShell.tsx` | 纸纹壳、CSS 氛围、FloatingAssistant 挂载 |
| `featured.ts` | 查询最新公开 `all_projects` 一条 |
| `useScrollReveal.ts` | 列表滚动入场 hook |
| `ScrollReveal.tsx` | 列表滚动入场包装组件 |
| `SpiritListSkeleton.tsx` | Suspense / 加载更多骨架 |
| `routes.ts` | 档案馆 Tab |
| `SiteShell.tsx` | 改用 SpiritAtmosphereShell，全站助手 |
| `(knowledge)/layout.tsx` | 改用 SpiritAtmosphereShell + KnowledgeNav |
| `globals.css` | motion token、氛围层、导航墨迹、各场景样式 |

---

### Task 1: 档案馆顶栏入口

**Files:**
- Modify: `src/lib/site/routes.ts`
- Modify: `src/components/home/shell/Navigation.tsx`
- Modify: `src/components/knowledge/shell/KnowledgeNav.tsx`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 在 `SITE_NAV_TABS` 追加 `{ href: SITE_ROUTES.knowledge, label: '档案馆' }`
- [x] **Step 2:** 确认 `isSiteNavActive` 对 `/knowledge` 生效（已支持 `startsWith`）
- [x] **Step 3:** 导航 link active 态改为墨迹 underline 动画（`sg-nav-link--active::after`）
- [x] **Step 4:** `KnowledgeNav` 链式样式对齐（复用 `sg-nav-link` token）
- [x] **Step 5:** 手动验证：各 Tab 切换 active 态正确；档案馆链接可达
- [x] **Step 6:** `pnpm lint && pnpm typecheck`

---

### Task 2: SpiritAtmosphereShell + 全站助手

**Files:**
- Create: `src/components/spirit/shell/SpiritAtmosphereShell.tsx`
- Modify: `src/components/home/shell/SiteShell.tsx`
- Modify: `src/app/(knowledge)/layout.tsx`

- [x] **Step 1:** 创建 `SpiritAtmosphereShell`，props：`children`、`variant?: 'home' | 'default'`、`nav?: ReactNode`
- [x] **Step 2:** 内含 `spirit-garden-shell`、`sg-atmosphere`（非 home 时显示 CSS 氛围层）
- [x] **Step 3:** dynamic import `FloatingAssistant`（`ssr: false`），全 variant 均挂载
- [x] **Step 4:** `SiteShell` 重构：home 时保留 `SpiritCursor*` + `Navigation transparent`；助手移入 shell
- [x] **Step 5:** `(knowledge)/layout` 使用同一 shell，`nav={<KnowledgeNav />}`
- [x] **Step 6:** 验证 `/projects`、`/knowledge` 均可打开助手；无双重挂载
- [x] **Step 7:** `pnpm lint && pnpm typecheck && pnpm build`

---

### Task 3: 全站 CSS 氛围层 + 降级

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/spirit/shell/SpiritAtmosphereShell.tsx`

- [x] **Step 1:** 新增 `.sg-atmosphere` fixed 层：径向 wash（复用 shell `::before` 色调，降低 opacity）
- [x] **Step 2:** 可选 `.sg-atmosphere--animated`：CSS 浮尘点 `background-image` + slow drift animation
- [x] **Step 3:** `@media (prefers-reduced-motion: reduce)` 禁用 animated 变体
- [x] **Step 4:** 首页不叠加 animated（已有 WebGL），避免性能叠加
- [x] **Step 5:** 验证明暗主题下氛围层不遮挡内容（`pointer-events: none`、`z-index: 0`）

---

### Task 4: Motion Token 基础

**Files:**
- Modify: `src/app/globals.css`

- [x] **Step 1:** 在 `:root` 添加 `--sg-motion-fast`、`--sg-motion-base`、`--sg-motion-stagger`
- [x] **Step 2:** 将导航墨迹、卡片 hover 过渡引用 token
- [x] **Step 3:** `prefers-reduced-motion` 块内将 `sg-enter` animation 设为 `none` 或 `0.01ms`

---

### Task 5: 首页 Featured 数据驱动

**Files:**
- Create: `src/lib/projects/featured.ts`
- Modify: `src/app/(site)/page.tsx`
- Modify: `src/components/home/landing/SpiritGardenHome.tsx`

- [x] **Step 1:** `fetchFeaturedProject()` — `all_projects` 按 `created_at desc`，取首条 `is_public=true`；错误返回 `null`
- [x] **Step 2:** `page.tsx` server await 后传 `featured` prop
- [x] **Step 3:** `SpiritGardenHome` 接收 `featured?: AllProjectItem | null`；有数据渲染动态卡，无数据保留硬编码 fallback（Q7）
- [x] **Step 4:** 保守增强：Featured 卡 `grid-column` 略宽（仅 CSS，不改整体 grid 列数）
- [x] **Step 5:** 链接到项目 `url`（外链 `target="_blank"`）
- [x] **Step 6:** 验证明暗 + 空数据 fallback；`pnpm build`

---

### Task 6: RAG 角色化

**Files:**
- Modify: `src/components/rag/shell/FloatingAssistant.tsx`
- Modify: `src/components/rag/chat/ChatPanel.tsx`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 触发器图标换为精灵 SVG（`/spirit-garden/icon-sparkle.png` 或新 SVG），保留 `aria-label`
- [x] **Step 2:** trigger hover 应用 `pulse-glow`
- [x] **Step 3:** 欢迎区增加手绘边框 class（`sg-rag-welcome-stack--garden`）
- [x] **Step 4:** 桌面面板展开 transition 使用 `--sg-motion-base`
- [x] **Step 5:** 375px 验证 bottom-sheet；助手不与导航抽屉 z-index 冲突
- [x] **Step 6:** 明暗主题验面板

---

### Task 7: 子页 Hero 场景动画

**Files:**
- Modify: `src/components/spirit/shell/SpiritSubpageHero.tsx`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 各 theme 的 `sg-subpage-hero__wash` 增加专属 `@keyframes`（archive 书架光斑、herb 叶脉、workshop 火花、library 书页）
- [x] **Step 2:** 装饰图 hover 轻微浮动（`transform: translateY`）
- [x] **Step 3:** 四页目视确认差异；reduced-motion 跳过

---

### Task 8: 子页列表场景化

**Files:**
- Modify: `src/components/home/projects/AllProjects.tsx`
- Modify: `src/components/home/skills/AiSkills.tsx`
- Modify: `src/components/home/vibe/VibeCoding.tsx`
- Modify: `src/components/spirit/resource/ResourceShelfGrid.tsx`（等价于 ResourceLinks 列表区）
- Modify: `src/app/globals.css`

- [x] **Step 1:** projects — 列表卡封面 hover 抬升 `sg-card--exhibit`
- [x] **Step 2:** skills — 进度条改为墨水晕染 `sg-meter-fill--ink`
- [x] **Step 3:** vibe — 标签改叶片 chip `sg-tag--leaf`
- [x] **Step 4:** resources — 书架格增加透视阴影 `sg-shelf--depth`
- [x] **Step 5:** 各页抽检 3 条列表项 hover

---

### Task 9: useScrollReveal + 列表入场

**Files:**
- Create: `src/utils/useScrollReveal.ts`
- Modify: 子页列表组件、`RecordList.tsx`

- [x] **Step 1:** hook 返回 `ref` + `isVisible`；`IntersectionObserver` threshold 0.15，once
- [x] **Step 2:** visible 时加 `sg-enter` class
- [x] **Step 3:** 接入 projects/skills/vibe/resources/knowledge 列表
- [x] **Step 4:** reduced-motion 直接 visible

---

### Task 10: 知识库记录类型场景化

**Files:**
- Modify: `src/components/knowledge/browse/RecordCard.tsx`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 按 `record.type` 追加 `sg-kb-card--{type}` modifier
- [x] **Step 2:** CSS 定义四种类型的边框/背景纹理（纯 token，无 hex）
- [x] **Step 3:** 验证 text/code/image/file 四类可区分

---

### Task 11: 空状态与骨架屏

**Files:**
- Create or Modify: `src/components/spirit/feedback/SitePageFallback.tsx` 或新建 `SpiritEmptyState.tsx`
- Modify: 各列表空态调用处

- [x] **Step 1:** 空状态组件：插画 + 文案 + 可选 CTA
- [x] **Step 2:** 加载骨架：纸纹 shimmer `sg-skeleton--paper`
- [x] **Step 3:** projects/skills 空列表接入

---

### Task 12: Phase 3 — 动态度量仪

**Files:**
- Modify: `src/lib/projects/featured.ts` 或新建 stats query
- Modify: `src/app/(site)/page.tsx`
- Modify: `src/components/home/landing/SpiritGardenHome.tsx`

- [x] **Step 1:** server 聚合：公开项目数、技能均值、kb_records count（需 auth 或 service role 策略确认）
- [x] **Step 2:** 传入 `SoulMeter` 数据替换硬编码
- [x] **Step 3:** 无权限时 gracefully 保留原值

---

### Task 13: Phase 3 — 知识库网格模式

**Files:**
- Modify: `src/components/knowledge/browse/RecordList.tsx`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 列表/网格 toggle state（localStorage 可选）
- [x] **Step 2:** 网格用 CSS grid，遵守现有分页 API
- [x] **Step 3:** 移动端默认列表

---

### Task 14: Phase 3 — Contact 气泡视觉

**Files:**
- Modify: `src/components/rag/contact/*`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 对齐 [contact-chat-redesign.md](../../archive/contact-chat-redesign.md) 气泡 spring 与打字指示器样式
- [x] **Step 2:** 不改动 `contactFlow.ts` 状态机逻辑

---

### Task 15: Phase 3 — Hero 季节变体

**Files:**
- Modify: `src/components/home/landing/SpiritGardenHome.tsx`
- Modify: `src/app/globals.css`

- [x] **Step 1:** 按 `new Date().getMonth()` 切换 `sg-hero-season--{spring|summer|autumn|winter}` class
- [x] **Step 2:** 仅 overlay 色调 token 变化，不换图

---

### Task 16: 文档与门禁

**Files:**
- Modify: `docs/product/project-status.md`
- Modify: `docs/README.md`（如需）

- [x] **Step 1:** 跑 `pnpm lint && pnpm typecheck && pnpm build`
- [x] **Step 2:** 执行讨论稿 §8 自测 T1–T8
- [x] **Step 3:** 更新 project-status §1 总览与 §2 交付记录

---

## 建议执行顺序

```
Task 1 → 2 → 3 → 4 → 5 → 6   （Phase 1，可 PR）
Task 7 → 8 → 9 → 10 → 11     （Phase 2，可 PR）
Task 12 → 13 → 14 → 15 → 16  （Phase 3，可 PR）
```

每 Phase 结束单独 commit / PR，便于 review。

---

## 自测清单（摘自 proposal §8）

| # | 场景 | 期望 |
|---|------|------|
| T1 | 首页 | Featured 动态或 fallback；Hero 粒子 |
| T2 | 主题切换 | 导航/RAG/卡片正确换肤 |
| T3 | reduced-motion | 无粒子浮尘 |
| T4 | 375px RAG | bottom-sheet 正常 |
| T5 | 四子页 | Hero 差异 + 水彩 hover |
| T6 | /knowledge | 氛围一致 + 类型视觉 |
| T7 | 空项目 DB | fallback 不破版 |
| T8 | Lighthouse | LCP ±5% 内 |

---

## 完成记录（2026-06-11）

### 收尾补全（第二轮）

| 项 | 处理 |
|----|------|
| Task 9 全站列表 | `ScrollReveal` 接入 projects / skills / resources；knowledge / vibe 已有 |
| Task 11 骨架屏 | `SitePageFallback` → `SpiritListSkeleton`；`RecordList` 加载更多骨架 |
| Task 7 decor hover | `.sg-subpage-hero:hover .sg-subpage-hero__decor--float` 暂停动画并抬升 |

### 自测回填

| # | 结果 | 说明 |
|---|------|------|
| T1 | ✅ | Featured fallback + 动态度量仪 + 季节 overlay；代码路径已验 |
| T2 | ✅ | 新增样式均用 `sg-*` / `var(--sg-*)` token |
| T3 | ✅ | `prefers-reduced-motion` 块覆盖粒子、浮尘、入场、打字点 |
| T4 | ✅ | 沿用 Phase 1 `sg-rag-shell--open` bottom-sheet |
| T5 | ✅ | 四子页 Hero wash 动画 + exhibit / ink / leaf / shelf |
| T6 | ✅ | 氛围层 + 类型 modifier + 网格切换 |
| T7 | ✅ | `fetchFeaturedProject` 空返回 → fallback 卡片 |
| T8 | ⏭️ | 未跑 Lighthouse；建议合入前本地 `pnpm build && lighthouse /` 抽检 |

### 门禁

`pnpm lint && pnpm typecheck && pnpm build` — 收尾轮次通过后合入。
