# 页脚信息架构精简设计

## 目标

精简全站 `SiteFooter` 链接密度，页脚只保留主 Tab 与联系转化；将「技能工坊 / 资源」的桌面发现路径补到顶栏「更多」下拉，避免删页脚后桌面无处可达。

## 决策摘要

| 项 | 决策 |
|----|------|
| 优化焦点 | 信息架构（非视觉大改） |
| 页脚链接 | 仅 `SITE_NAV_TABS` + 明文邮箱 + GitHub |
| 页脚移除 | `SITE_NAV_SECONDARY`、展柜、庭园志、庭园度量、工作台 |
| 次级发现 | 紧凑抽屉保持现状；桌面新增「更多」下拉承载 `SITE_NAV_SECONDARY` |
| 硬约束 | 邮箱明文 `mailto:`、GitHub 真实链接（产品 Q3A） |

## 信息架构

### 页脚

- 左：`© {year} SpiritGarden`
- 中：庭院 / 归档 / 草本集 / 档案馆 / 园主（`SITE_NAV_TABS`）
- 右：明文邮箱 + GitHub 图标链接

### 顶栏

- 桌面：5 个主 Tab 不变；其后增加「更多」按钮，菜单内为技能工坊、资源
- 紧凑（≤1024）：抽屉已含主 Tab + divider + 次级两项，行为不变
- `Navigation` 与 `KnowledgeNav` 对齐

### 不进页脚

- `/showcase`、`/changelog`、`/stats`、`/studio`（访客页脚不暴露工作台）

## 组件与交互

### 涉及文件

- `src/components/home/shell/SiteFooter.tsx`
- `src/components/home/shell/Navigation.tsx`
- `src/components/knowledge/shell/KnowledgeNav.tsx`
- `src/app/globals.css`（`sg-nav-*` 下拉样式）
- `e2e/core-paths.spec.ts`

### 「更多」下拉

- 触发按钮文案「更多」；`aria-expanded`、`aria-haspopup="menu"`
- 菜单：`role="menu"`；项为 `SITE_NAV_SECONDARY`；当前路径高亮
- 关闭：点击外部、Escape、选择链接后
- 不计入主 Tab 数量，保持「5 Tab」认知

### 数据源

- 继续使用 `SITE_NAV_TABS` / `SITE_NAV_SECONDARY`，不新增路由常量

## 验收标准

1. 桌面页脚仅含 5 个主 Tab + 邮箱 + GitHub，无技能工坊/资源/展柜/庭园志/度量/工作台。
2. 桌面「更多」可打开/关闭，并可导航至技能工坊、资源。
3. 紧凑抽屉仍展示主 Tab 与次级两项。
4. `/about` 邮箱仍为明文 `mailto:`（既有 T4）。
5. 深色模式下拉可读、焦点可见。
6. 更新 e2e：移除「页脚含技能工坊与资源」；新增桌面「更多」断言。
7. `pnpm lint` 与 `pnpm typecheck` 通过。

## 非目标

- 页脚视觉气质大改、多列分组、备案信息
- 将展柜/庭园志/度量/工作台迁入「更多」
- 改动 RAG、园主页联系区文案
