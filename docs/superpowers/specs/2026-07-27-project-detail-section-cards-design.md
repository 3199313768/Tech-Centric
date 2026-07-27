# 项目详情分区卡片布局设计

## 目标

统一改版全部项目详情页（`/projects/[slug]`）视觉布局：在保留现有信息架构与数据字段的前提下，用浅底色 surface 分区卡片强化「痛点 / 贡献 / 亮点」等叙事节奏，提升设计感。

## 决策摘要

| 项 | 选择 |
|---|---|
| 范围 | 全部项目详情页（非单页特例） |
| 布局方向 | 分区叙事 + 标题下单张封面图 |
| 分区视觉 | 浅底色 surface 卡片 + 弱边框 |
| 实现策略 | 仅样式层（方案 1）：加 class + CSS，不拆组件、不改数据模型 |
| 参考样例 | `proj-20` 等任意 slug，共用同一 `ProjectDetailView` |

## 范围

包含：

1. `ProjectDetailView` 为正文各 `section` / 联系区补充分区卡片 class（结构与字段顺序不变）。
2. `globals.css` 中 `.sg-project-detail*` 样式：hero 节奏、封面图、分区卡片、正文层级。
3. 桌面 / 窄屏、亮色 / 暗色 token 可读性。

不包含：

- 数据模型、查询、slug、种子文案（含 `proj-20` 内容补全）
- 组件拆分为 Hero / Section / Actions 等子模块
- 双栏粘性侧栏
- 编号竖线、杂志大字压图等其它视觉方向
- 主动改 Vibe / Knowledge 详情结构（仅共享 `__back` 等样式时保持兼容）

## 整页骨架

自上而下固定为：

1. **Hero**：返回链接 → 分类 eyebrow → 标题 → 周期 / 角色 → 标签  
   - 字段与 DOM 顺序不变  
   - 标题字号与区块间距略加大，仍用现有 token
2. **封面**：标题下、正文上，单张大图  
   - 有 `screenshots[0]` 才渲染  
   - 圆角 + 弱阴影；宽度仍受详情页 `max-width: 960px` 约束
3. **正文分区卡片**（有内容才渲染整块）：  
   - 业务痛点 / 核心功能  
   - 主导工作 / 核心贡献  
   - 亮点成果  
   - 技术栈  
   - 详细说明（`body`）
4. **CTA**：访问项目 / 需内网提示 — 单独一行，**不**再套卡片
5. **合作联系**：与正文同款 surface 卡片（有邮箱才渲染）

## 分区卡片规格

| 属性 | 约定 |
|---|---|
| 背景 | `var(--sg-surface-elevated)`（与站内其它卡片一致） |
| 边框 | `1px solid var(--sg-border-subtle)` |
| 圆角 | 现有 `--sg-radius-lg` |
| 内边距 | 约 `1.25–1.5rem` |
| 卡片间距 | 约 `1–1.25rem` |
| 标题 | `h2` 略加重 / 略大，对比正文更清晰 |
| 正文 | `--sg-text-secondary`，行高约 `1.7` |
| 亮点 | 保持现有 `ul` 结构，置于卡片内 |
| 技术栈 | 保持 `sg-tag` 行，置于卡片内 |

禁止：hex 色、新紫色主题、厚多层阴影、圆角胶囊堆砌。

## 实现边界

| 文件 | 改动 |
|---|---|
| `src/components/home/projects/ProjectDetailView.tsx` | 为 section / contact 增加 class；不改字段逻辑 |
| `src/app/globals.css` | 扩展 `.sg-project-detail*` 样式 |
| e2e | 尽量保留 `.sg-project-detail__hero` 等现有选择器；不为样式单独扩测除非选择器被删 |

不改：`allProjects` 类型、mapper、queries、actions、seed SQL、路由。

## 测试与验证

- 有图 / 无图项目：无图时无空白媒体坑
- 窄屏：卡片不横向溢出
- 亮色 / 暗色：边框与正文对比可读
- 现有 `e2e/archive.spec.ts` 中详情相关断言仍通过
- `pnpm lint` / `pnpm typecheck`（触及文件无新增类型问题）

## 成功标准

打开任意 `/projects/[slug]`，首屏仍为标题 + 封面；正文各叙事块呈现为清晰的浅底色分区卡片；访问 CTA 不套空卡片；联系区与分区视觉一致；全站详情页外观统一。
