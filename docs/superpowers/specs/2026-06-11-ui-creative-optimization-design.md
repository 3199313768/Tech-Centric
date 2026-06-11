# UI 创意优化 — 设计定稿

> 定稿日期：2026-06-11  
> 状态：**已批准，待实施**  
> 讨论稿：[ui-creative-optimization-proposal.md](../../product/ui-creative-optimization-proposal.md)  
> 实施计划：[2026-06-11-ui-creative-optimization.md](../plans/2026-06-11-ui-creative-optimization.md)

---

## 1. 目标

在 SpiritGarden 世界观下，对**首页、子页、知识库、RAG 助手**四区同步做保守增强式创意升级，使全站具备场景叙事感与统一氛围，同时不改动数据模型与路由架构。

---

## 2. 已锁定决策

| 项 | 决策 |
|----|------|
| 方案组合 | A 叙事增强（主）+ C 助手全站 + B 仅 Featured 区点缀 |
| 创意范围 | 四区全部 |
| 布局 | 保守增强，不推翻现有 grid / 列表 |
| 顶栏 | 新增「档案馆」→ `/knowledge` |
| 助手 | 全站 `FloatingAssistant`（`(site)` + `(knowledge)` 均需可达） |
| 动效 | 首页 WebGL；全站 CSS 氛围层；统一降级 |
| 主题 | 明暗同步交付 |
| 首页 Featured | DB 驱动 + 硬编码 fallback |
| 插画 | 现有素材优先，可增补 |

### Q5 技术释义

「全站」指**氛围覆盖全站**，而非全站 WebGL：

- **首页 Hero**：`SpiritDustCanvas`（WebGL）
- **其余页面**：`sg-atmosphere` CSS 层（径向 wash + 可选 CSS 浮尘 `animation`，无 WebGL context）
- **降级**：`prefers-reduced-motion` 或 WebGL 初始化失败 → 隐藏 canvas / 停用 CSS 浮尘，保留静态纸纹

---

## 3. 架构

```
┌─────────────────────────────────────────────────────────┐
│  app/layout.tsx（字体、ThemeProvider）                      │
├─────────────────────────────────────────────────────────┤
│  (site)/layout → SiteShell                               │
│    ├ spirit-garden-shell [--home]                        │
│    ├ sg-atmosphere（非首页 CSS 氛围）                       │
│    ├ Navigation（含档案馆 Tab + 墨迹 active）               │
│    ├ children（各子页 / 首页）                              │
│    ├ FloatingAssistant（全站）                            │
│    └ SpiritCursor*（仅首页，保持现状）                       │
├─────────────────────────────────────────────────────────┤
│  (knowledge)/layout                                      │
│    ├ spirit-garden-shell + sg-atmosphere                 │
│    ├ KnowledgeNav（风格对齐 sg-nav 墨迹）                  │
│    ├ children                                            │
│    └ FloatingAssistant（独立挂载，与 SiteShell 不重复）     │
└─────────────────────────────────────────────────────────┘
```

**注意**：`(site)` 与 `(knowledge)` 为平行 route group，知识库不经过 `SiteShell`。全站助手需在两处 layout 各挂载一次，或抽取 `SpiritAtmosphereShell` 共享包装器（推荐后者，避免重复逻辑）。

---

## 4. 分区设计

### 4.1 导航 `SITE_NAV_TABS`

```ts
// 追加项（位于「资源」之后或按产品排序）
{ href: SITE_ROUTES.knowledge, label: '档案馆' }
```

- `isSiteNavActive` 对 `/knowledge` 前缀生效
- 每项 hover：对应 mini 装饰（CSS `::after` 或 inline SVG，尺寸 ≤16px）
- active：底部墨迹 underline（`sg-nav-link--active` 动画，280ms）

知识库 `KnowledgeNav` 同步墨迹 active 样式（复用 `sg-nav-link` token）。

### 4.2 首页

**数据流**：

```
(site)/page.tsx (Server)
  → fetchFeaturedProject()  // 取 all_projects 最新 is_public 一条
  → <SpiritGardenHome featured={...} />
```

**Featured 卡片**：
- 有数据：名称、描述、tags、screenshots[0] 或 fallback 图
- 无数据：保留现有「幻梦之森 3D」静图与文案
- 保守增强：主卡略宽（`sg-card--featured` grid-column span 调整），不改为全 Bento

**动态度量仪（Phase 3）**：
- 创造力 → frontend 技能均值（已有逻辑）
- 咖啡因 → 固定装饰值或 vibe 笔记数
- 宁静度 → 知识库条目数映射 0–100

### 4.3 子页

| 路由 | Hero 主题 | 列表增强 |
|------|-----------|----------|
| `/projects` | archive | 封面 hover 抬升 + 纸边阴影 |
| `/skills` | workshop | 进度条「墨水晕染」填充动画 |
| `/vibe` | herb | 叶片形 tag chip |
| `/resources` | library | 书架透视阴影强化 |

共用：`useScrollReveal` 为列表项添加 `sg-enter`（`IntersectionObserver`，once）。

### 4.4 知识库

- 已有 `spirit-garden-shell`；补充 `sg-atmosphere` 与主站一致
- `RecordCard` 按 type 加修饰 class：
  - `sg-kb-card--text` 羊皮纸边框
  - `sg-kb-card--code` 石板纹理 overlay
  - `sg-kb-card--image` 相框
  - `sg-kb-card--file` 卷轴封口
- Phase 3：列表 / 网格 toggle（遵守现有分页，禁止无 UI limit）

### 4.5 RAG 助手（全站）

**触发器**：
- 替换 Bot 图标为庭院精灵 SVG（`public/spirit-garden/` 或 inline）
- hover：`pulse-glow` keyframes（已有）
- `aria-label` 保持

**面板**：
- 欢迎区手绘边框（`sg-rag-welcome-stack` 扩展）
- 桌面：spring 展开；移动：现有 bottom-sheet 保持

**挂载**：
- 新建 `SpiritAtmosphereShell` 或 `AssistantMount` 小组件
- `(site)/SiteShell` 与 `(knowledge)/layout` 共用

**排除**：`/knowledge` 登录页若布局极简，助手 z-index 不得遮挡表单（`sg-rag-shell` z-index 复核）。

### 4.6 Motion Token（新增至 `globals.css`）

```css
:root {
  --sg-motion-fast: 150ms ease-out;
  --sg-motion-base: 280ms cubic-bezier(0.22, 1, 0.36, 1);
  --sg-motion-stagger: 80ms;
}

@media (prefers-reduced-motion: reduce) {
  .sg-atmosphere--animated,
  .sg-spirit-dust-canvas,
  .sg-enter { /* 缩短或禁用 */ }
}
```

---

## 5. 非目标

- 不改 Supabase schema / RAG 索引
- 不新增独立 `/ask` 页
- 不全站 WebGL
- 不引入新 CSS 框架

---

## 6. 验收标准

### 功能

- [ ] 顶栏可见「档案馆」，点击进入 `/knowledge`
- [ ] 任意 `(site)` 子页与 `/knowledge` 均可打开助手
- [ ] 首页 Featured 展示 DB 最新公开项目；空表显示 fallback
- [ ] 非首页有 CSS 氛围层；首页有 WebGL 粒子
- [ ] `prefers-reduced-motion` 下粒子与浮尘禁用

### 工程

- [ ] `pnpm lint && pnpm typecheck && pnpm build` 通过
- [ ] 新样式仅用 `sg-*` / `var(--sg-*)`
- [ ] a11y：`aria-label`、键盘 Esc 关闭抽屉/助手

### 体验

- [ ] 四区气质统一，子页场景可区分
- [ ] 明暗主题无破版

---

## 7. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 全站助手遮挡知识库录入 | z-index 分层；modal 打开时隐藏 trigger |
| 双 layout 重复挂载助手 | 抽取共享 shell 组件 |
| 首页 client 拉数 | Server page 传 props，避免 client fetch |
| `globals.css` 膨胀 | 新块集中写在 `/* UI Creative */` 注释区 |

---

## 8. 文件清单

| 操作 | 路径 |
|------|------|
| 新建 | `src/components/spirit/shell/SpiritAtmosphereShell.tsx` |
| 新建 | `src/utils/useScrollReveal.ts` |
| 新建 | `src/lib/projects/featured.ts`（或扩 queries.ts） |
| 修改 | `src/lib/site/routes.ts` |
| 修改 | `src/components/home/shell/SiteShell.tsx` |
| 修改 | `src/components/home/shell/Navigation.tsx` |
| 修改 | `src/components/home/landing/SpiritGardenHome.tsx` |
| 修改 | `src/app/(site)/page.tsx` |
| 修改 | `src/app/(knowledge)/layout.tsx` |
| 修改 | `src/components/knowledge/shell/KnowledgeNav.tsx` |
| 修改 | `src/components/rag/shell/FloatingAssistant.tsx` |
| 修改 | `src/components/rag/chat/ChatPanel.tsx` |
| 修改 | `src/components/spirit/shell/SpiritSubpageHero.tsx` |
| 修改 | `src/components/knowledge/browse/RecordCard.tsx` |
| 修改 | 各子页列表组件 |
| 修改 | `src/app/globals.css` |

---

*实施细节见 plans 文档；合入后更新 [project-status.md](../../product/project-status.md)。*
