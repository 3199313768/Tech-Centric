# UI 创意优化方案（讨论稿）

> 起草日期：2026-06-11  
> 定稿日期：2026-06-11  
> 状态：**已实施（Phase 1–3）** — 决策见 §6；spec / plan 见 `docs/superpowers/`  
> 关联：[project-status.md](./project-status.md)、[前端代码规范.md](../engineering/前端代码规范.md)、`docs/superpowers/plans/2026-06-09-spiritgarden-theme.md`

---

## 1. 背景与目标

### 1.1 为什么要做

站点已完成 SpiritGarden 暖色主题迁移（纸纹、水彩、庭院 Hero、WebGL 灵尘粒子），功能面（子页 CRUD、知识库 MVP、RAG 助手）也已跑通。当前瓶颈不在「能不能用」，而在**视觉叙事与交互惊喜感不足**：

| 观察 | 具体表现 |
|------|----------|
| 首页叙事偏静态 | 「幻梦之森 3D」等内容硬编码，与 Supabase 真实数据脱节 |
| 子页气质趋同 | `SpiritSubpageHero` + `SpiritListCard` 模式重复，缺少各 Tab 的「场景感」差异 |
| 知识库风格割裂 | 功能完整，但浏览体验更像管理后台，而非「档案馆」 |
| 助手存在感弱 | `FloatingAssistant` 为通用 Bot 图标，与庭院世界观未融合 |
| 动效利用不均 | 首页有 `sg-enter`、水彩 hover、WebGL；子页与知识库动效密度明显偏低 |
| 跨页体验断裂 | 首页有透明导航 + 全宽 Hero；子页瞬间切回「文档站」节奏 |

### 1.2 「更有创造力」在本项目中的定义

不追求炫技或堆特效，而是在 **SpiritGarden 世界观**（吉卜力式温润、数字庭院隐喻）下，让访客感受到：

1. **有故事** — 每个区域像场景而非列表页
2. **有呼吸** — 微动效、粒子、水彩晕染传达「活物感」
3. **有惊喜** — 适度非常规布局与交互，但不牺牲可读性与 a11y
4. **有连贯** — 首页 → 子页 → 知识库 → 助手，气质统一

### 1.3 非目标（本轮不做）

- 不改数据模型、路由结构、RAG 索引策略
- 不引入新 UI 框架（保持 Tailwind 4 + `sg-*` + CSS 变量）
- 不做全站 3D 场景或大体积 WebGL（性能与维护成本过高）
- 不替换 `react-markdown`、不将密钥暴露到客户端

---

## 2. 现状资产盘点

### 2.1 可复用能力（建议保留并扩展）

| 资产 | 位置 | 价值 |
|------|------|------|
| `--sg-*` 设计 token | `globals.css` | 明暗主题、纸纹、墨绿体系已成型 |
| `SpiritDustCanvas` | `landing/SpiritDustCanvas.tsx` | WebGL 灵尘粒子，可降级为 CSS 动画 |
| `handleWatercolorHover` | `utils/watercolorHover.ts` | 卡片水彩晕染，可推广到更多表面 |
| `sg-enter` 入场序列 | `globals.css` | 阶梯延迟入场，可标准化为 motion token |
| `SpiritSubpageHero` 四主题 | `spirit/shell/` | archive / herb / workshop / library 场景头图 |
| `SpiritListCard` 三变体 | list / herb / scroll | 列表卡片已有差异化基础 |
| Framer Motion | 子页卡片 | spring 入场，可统一 motion 规范 |

### 2.2 主要差距

| 区域 | 差距 |
|------|------|
| 首页 | 内容静、卡片 grid 规整、缺滚动叙事 |
| `/projects` | 列表为主，缺「作品展览」感 |
| `/skills` | 技能条/卡片常规，缺「卷轴展开」叙事 |
| `/vibe` | 草本隐喻未充分视觉化 |
| `/resources` | 资源架已有组件，但与庭院场景连接弱 |
| `/knowledge` | 独立导航壳，SpiritGarden 氛围层薄 |
| RAG 助手 | 功能性 UI，缺角色化与庭院入口隐喻 |
| 导航 | 功能正确，缺场景切换仪式感 |

---

## 3. 三种整体方向（含取舍）

### 方案 A：叙事增强型（推荐）

**思路**：在现有组件与 token 上叠加「场景叙事层」——每页有独特 Hero 动效、滚动触发段落、数据驱动的首页模块，不推翻架构。

| 维度 | 说明 |
|------|------|
| 改动量 | 中 — 以 CSS + 组件 props 扩展为主 |
| 风险 | 低 — 不动数据层，可逐页交付 |
| 创意密度 | 中高 — 靠叙事与微交互取胜 |
| 性能 | 可控 — WebGL 仅首页 Hero，其余 CSS |

**典型交付**：
- 首页 Featured 卡片接入最新 `all_projects`
- 各子页 Hero 增加主题专属装饰动画（CSS `@keyframes`）
- 知识库 RecordCard 增加「档案标签」视觉与类型图标场景化
- RAG 触发器改为「庭院精灵」造型 + 开启动画

### 方案 B：布局突破型

**思路**：引入杂志式 / 不对称网格 / 横向滚动展区，首页与子页采用更激进的排版（类似 README 提到的 magazine-layout 遗产能力）。

| 维度 | 说明 |
|------|------|
| 改动量 | 高 — 大量布局重构 |
| 风险 | 中高 — 响应式与 a11y 回归面大 |
| 创意密度 | 高 — 视觉冲击强 |
| 性能 | 中 — 大图为多，需 `next/image` 优化 |

**典型交付**：
- 首页改为非对称 Bento Grid + 横向项目胶片
- `/projects` 改为瀑布流 + 灯箱预览
- 知识库改为 Masonry + 侧边「书架」导航

### 方案 C：角色互动型

**思路**：强化 AI 助手与站点的角色绑定，以「庭院向导」串联各页；UI 创意主要投入在对话式导航、情境提示、联系流程。

| 维度 | 说明 |
|------|------|
| 改动量 | 中高 — RAG UI + 全站助手挂载 |
| 风险 | 中 — 与 [project-status §3.4](./project-status.md) 全站助手决策耦合 |
| 创意密度 | 高 — 交互创新集中在助手 |
| 性能 | 低影响 — 助手面板按需加载 |

**典型交付**：
- 全站 `FloatingAssistant`（含子页）
- 助手人格化欢迎语 + 页面情境建议
- 归档 [contact-chat-redesign](../archive/contact-chat-redesign.md) 气泡联系视觉

### 推荐组合

**A 为主 + C 的轻量切片 + B 的元素点缀**：

1. 先用方案 A 建立全站叙事一致性（性价比最高）
2. 同步做 C 的「助手角色化」— 仅改触发器与面板皮肤，不全站挂载（避免范围膨胀）
3. 在 `/projects` 或首页 Featured 区引入 B 的「胶片/不对称」作为创意锚点

---

## 4. 分区优化提案

### 4.1 首页（`SpiritGardenHome`）

**现状**：庭院 Hero + 4 卡 grid；灵尘粒子；硬编码案例。

**提案**：

| 项 | 描述 | 优先级 |
|----|------|--------|
| 数据驱动 Featured | 从 `all_projects` 取最新/置顶项渲染主卡，无数据时 fallback 现有静图 | P0 |
| 滚动叙事 | Hero 向下滚动时，背景视差 + 卡片依次 `sg-enter`（`IntersectionObserver`） | P1 |
| 灵魂度量仪动态化 | 指标与真实数据挂钩（项目数、技能均值、知识库条目数） | P2 |
| 感官实验室入口 | 卡片链到 `/vibe` 时带 query 高亮最新笔记 | P3 |
| Hero 季节变体 | 按月份切换 overlay 色调（春粉/夏绿/秋金/冬雾），纯 CSS token 切换 | P3 |

**创意锚点示意**：

```
┌─────────────────────────────────────────────┐
│  [Hero: 景观图 + 灵尘粒子 + 视差 overlay]      │
│  欢迎来到我的数字庭院                           │
│  [探寻作品]  [了解我]                           │
├─────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌───────────────┐   │
│  │ Featured Project │  │ 灵魂度量仪     │   │
│  │ (动态数据)        │  │ (动态指标)     │   │
│  └──────────────────┘  └───────────────┘   │
│  ┌────────────┐  ┌─────────────────────┐   │
│  │ 感官实验室  │  │ 技能卷轴 chips       │   │
│  └────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────┘
```

### 4.2 导航（`Navigation`）

**提案**：

| 项 | 描述 | 优先级 |
|----|------|--------|
| Tab 场景图标 | 每 Tab 配 mini 装饰（卷轴/叶子/背包），hover 时轻摆 | P1 |
| 活跃指示器 | 当前 Tab 底部「墨迹」underline 动画，替代静态 border | P1 |
| 页面切换淡入 | 路由变化时 `sg-page-transition`（opacity + translateY 8px，200ms） | P2 |
| 知识库入口 | 评估是否在 `SITE_NAV_TABS` 增加「档案馆」（见 project-status §5） | 待决策 |

### 4.3 子页共性（`SpiritSubpageHero` + 列表）

**提案**：

| 子页 | 主题 | 创意增强 |
|------|------|----------|
| `/projects` 归档 | archive | Hero 背景「书架景深」CSS 层；列表项 hover 时封面轻抬升 + 纸边阴影 |
| `/skills` 技能工坊 | workshop | 技能条改为「卷轴进度」— 填充像墨水晕染；新增 radar 或 constellation 小图（CSS/SVG） |
| `/vibe` 草本集 | herb | 卡片轻微随机旋转（已有 herb variant）；标签用叶片形 chip |
| `/resources` 资源 | library | 利用 `ResourceShelfGrid`，书架透视 + 书脊色带（platform accent 已有） |

**共用增强**：
- 空状态插画（`/spirit-garden/` 现有素材扩展）
- 列表加载骨架：纸纹 shimmer，而非灰色 pulse

### 4.4 知识库（`/knowledge`）

**现状**：`KnowledgeNav` + `RecordCard` 复用 `SpiritListCard`，偏工具感。

**提案**：

| 项 | 描述 | 优先级 |
|----|------|--------|
| 氛围层接入 | `spirit-garden-shell` 纸纹与 wash 延伸到知识库 layout | P0 |
| 记录类型场景化 | text=羊皮纸 / code=石板 / image=相框 / file=封印卷轴（纯 CSS 边框与图标） | P1 |
| 标签云视觉 | `TagFilterBar` 改为「蜡封标签」或「书签」形态 | P2 |
| 浏览模式 | 列表 / 网格切换（网格用 Masonry，限 ≤50 条分页） | P2 |
| Cmd+K 录入 | 快捷录入 modal 增加「落笔」动画（墨水扩散） | P3 |

### 4.5 RAG 浮动助手

**现状**：`sg-rag-*` token 已收敛；Bot 图标；仅首页挂载。

**提案**：

| 项 | 描述 | 优先级 |
|----|------|--------|
| 角色化触发器 | Bot → 庭院精灵/灯笼精灵 SVG；hover 时 `pulse-glow`（已有 keyframes） | P0 |
| 面板世界观 | 欢迎区 `sg-rag-welcome-stack` 增加手绘边框与情境文案 | P1 |
| 开启动画 | 面板展开用 bottom-sheet spring（移动端已有 `--open`，补桌面展开） | P1 |
| 全站挂载 | 子页也可唤起 — **需单独决策**（见 §6 待决问题） | 待决策 |
| Contact 模式视觉 | 对齐 [contact-chat-redesign](../archive/contact-chat-redesign.md) 气泡美学 | P2 |

### 4.6 动效与微交互规范（建议新增）

在 `globals.css` 或 `docs/engineering/` 补充 motion token：

| Token | 值 | 用途 |
|-------|-----|------|
| `--sg-motion-fast` | 150ms ease-out | hover、focus |
| `--sg-motion-base` | 280ms cubic-bezier(0.22, 1, 0.36, 1) | 卡片、面板 |
| `--sg-motion-spring` | Framer stiffness 100 / damping 12 | 列表入场 |
| `--sg-motion-stagger` | 80ms | `sg-enter--n` 阶梯 |

**原则**：
- `prefers-reduced-motion: reduce` 时禁用粒子和视差
- WebGL 检测失败自动隐藏 canvas，不阻塞首屏

---

## 5. 分阶段实施路线

### Phase 0 — 对齐 ✅ 已完成（2026-06-11）

- [x] 方案组合：**A 叙事增强为主 + C 助手全站 + B 仅 Featured 点缀**
- [x] 创意重心：**首页 + 子页 + 知识库 + 助手（全部）**
- [x] 顶栏增加「档案馆」；助手全站挂载；WebGL 首页 + 全站 CSS 氛围降级

### Phase 1 — 基础设施与首触达（约 1–2 天）

| 任务 | 文件（预估） |
|------|-------------|
| 顶栏增加「档案馆」Tab | `lib/site/routes.ts`、`Navigation.tsx` |
| 全站挂载 FloatingAssistant | `SiteShell.tsx` |
| 首页 Featured 接 Supabase 数据 + fallback | `(site)/page.tsx`、`SpiritGardenHome.tsx`、`lib/projects/queries.ts` |
| RAG 触发器角色化 + 面板皮肤 | `FloatingAssistant.tsx`、`ChatPanel.tsx`、`globals.css` |
| 全站 CSS 氛围层（非首页 Hero） | `globals.css`、`SiteShell.tsx`、`(knowledge)/layout.tsx` |
| 导航活跃墨迹动画 + Tab 装饰 | `Navigation.tsx`、`globals.css` |

### Phase 2 — 四区场景化（约 2–3 天）

| 任务 | 文件（预估） |
|------|-------------|
| 各子页 Hero 装饰动画 | `SpiritSubpageHero.tsx`、`globals.css` |
| `/projects` 展览感 hover | `AllProjects.tsx`、`globals.css` |
| `/skills` 卷轴进度条 | `AiSkills.tsx`、`globals.css` |
| `/vibe` 草本叶片 chip | `VibeCoding.tsx`、`globals.css` |
| `/resources` 书架透视强化 | `ResourceLinks.tsx`、`globals.css` |
| 知识库记录类型场景化 | `RecordCard.tsx`、`globals.css` |
| 空状态与纸纹骨架屏 | `spirit/feedback/`、各列表组件 |
| 滚动入场（全站列表） | 新建 `useScrollReveal.ts` |

### Phase 3 — 深度创意（约 3–4 天）

| 任务 | 说明 |
|------|------|
| 首页视差 + 动态度量仪 | 项目数 / 技能 / 知识库条目挂钩 |
| 知识库网格模式 | 列表/网格切换，遵守分页 |
| Contact 气泡视觉升级 | 对齐 `contact-chat-redesign.md` |
| Hero 季节变体 | 按月 CSS token 切换 |
| 插画补充 | 复用现有素材为主，按需 Figma / AI 增补（Q8） |

---

## 6. 已确认决策（2026-06-11）

| # | 问题 | **确认结果** |
|---|------|-------------|
| Q1 | 创意投入重心？ | **全部** — 首页、子页、知识库、助手均纳入 |
| Q2 | 布局激进程度？ | **保守增强** — 保留现有 grid/列表骨架，叠加叙事与微交互 |
| Q3 | 知识库是否进顶栏 Tab？ | **是** — `SITE_NAV_TABS` 增加「档案馆」→ `/knowledge` |
| Q4 | 助手是否全站可用？ | **全站** — `SiteShell` 全路由挂载 `FloatingAssistant` |
| Q5 | WebGL / 氛围范围？ | **全站 CSS 氛围 + 首页 WebGL** — 首页 Hero 保留 `SpiritDustCanvas`；其余页面用 CSS 氛围层；全站统一 WebGL 检测与 `prefers-reduced-motion` 降级 |
| Q6 | 暗色模式优先级？ | **同步** — 每项交付同时验证明暗主题 |
| Q7 | 硬编码案例是否保留？ | **保留为 fallback** — Supabase 无数据时展示现有「幻梦之森 3D」静图卡片 |
| Q8 | 是否引入新插画资源？ | **均可** — 优先复用 `public/spirit-garden/`，不足时可用 Figma 或 AI 生成 |

---

## 7. 验收标准（确认实施后适用）

### 7.1 功能

- [ ] 首页 Featured 展示真实最新项目；Supabase 空表时显示 fallback，无报错
- [ ] 明暗主题切换后，新增动效与装饰无对比度/a11y 回归
- [ ] `prefers-reduced-motion` 下无粒子、无视差
- [ ] 移动端 ≤640px：RAG bottom-sheet、导航抽屉行为不退化

### 7.2 工程

- [ ] `pnpm lint && pnpm typecheck && pnpm build` 通过
- [ ] 新样式使用 `sg-*` / `var(--sg-*)`，无新增 hex（C4 规范）
- [ ] 交互控件保留 `aria-label` / 可见文本
- [ ] 无 `alert()` / `confirm()`

### 7.3 体验（主观）

- [ ] 5 秒内能感知「庭院」世界观，而非通用作品集模板
- [ ] 子页之间有明显场景差异，但色彩与字体仍统一
- [ ] 助手入口有角色感，面板展开流畅无布局跳动

---

## 8. 自测用例（实施后执行）

| # | 场景 | 操作 | 期望 |
|---|------|------|------|
| T1 | 首页加载 | 打开 `/`，等待首屏 | Hero 粒子可见；Featured 为 DB 最新项或 fallback |
| T2 | 主题切换 | 切换明暗 | 导航墨迹、卡片水彩、RAG 面板均正确换肤 |
| T3 | 减少动效 | OS 开启「减少动态效果」 | 粒子隐藏；入场动画缩短或跳过 |
| T4 | 移动端 RAG | 375px 宽打开助手 | bottom-sheet 贴底；遮罩可关 |
| T5 | 子页场景 | 依次访问 projects/skills/vibe/resources | Hero 主题装饰各异；列表 hover 有水彩 |
| T6 | 知识库氛围 | 打开 `/knowledge` | 纸纹背景与子页一致；记录类型视觉可区分 |
| T7 | 空数据 | DB 无项目时访问首页 | fallback 卡片展示；无空白破版 |
| T8 | 性能 | Lighthouse Performance | LCP 不明显劣化（较当前 ±5% 内） |

---

## 9. 云效验收点回填建议（立项后）

若作为云效需求立项，建议验收标准摘录：

1. 首页主展示项目来源于 Supabase，空数据有降级展示
2. 站点顶栏导航具备场景化视觉反馈（活跃态动画）
3. 知识库页面具备与子站一致的 SpiritGarden 氛围层
4. AI 助手入口完成角色化改造，移动端 bottom-sheet 正常
5. 明暗主题、减少动效、a11y 无回归
6. lint / typecheck / build 门禁通过

---

## 10. 相关文件索引

| 类型 | 路径 |
|------|------|
| 首页 | `src/components/home/landing/SpiritGardenHome.tsx` |
| 导航 | `src/components/home/shell/Navigation.tsx` |
| 全站壳 | `src/components/home/shell/SiteShell.tsx` |
| 子页 Hero | `src/components/spirit/shell/SpiritSubpageHero.tsx` |
| 列表卡 | `src/components/spirit/shell/SpiritListCard.tsx` |
| 知识库卡 | `src/components/knowledge/browse/RecordCard.tsx` |
| RAG | `src/components/rag/shell/FloatingAssistant.tsx` |
| 样式 SSOT | `src/app/globals.css` |
| 水彩 hover | `src/utils/watercolorHover.ts` |
| WebGL | `src/components/home/landing/SpiritDustCanvas.tsx` |

---

## 11. 下一步

1. ~~讨论确认 Q1–Q8~~ ✅
2. 定稿 spec：`docs/superpowers/specs/2026-06-11-ui-creative-optimization-design.md`
3. 实施计划：`docs/superpowers/plans/2026-06-11-ui-creative-optimization.md`
4. **实施**：按 Phase 1 → 2 → 3 分批交付，每批 `pnpm lint && pnpm typecheck && pnpm build`

---

*讨论定稿后请更新文首状态，并同步 [project-status.md](./project-status.md) §1 总览。*
