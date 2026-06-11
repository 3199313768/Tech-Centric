# Phase A 云效工作项拆分

> 日期：2026-06-11  
> 依据：[product-design-optimization.md](./product-design-optimization.md) §7 Phase A、§12 决策  
> 等级建议：**P2 标准功能**（多模块、含 DB 变更）

---

## Epic：Phase A — 信任与转化

### WI-A1 · 导航与园主页

| 字段 | 内容 |
|------|------|
| **标题** | 顶栏「园主」Tab + `/about` 园主页 |
| **优先级** | P0 |
| **描述** | 顶栏含「庭院」→ `/` 与「园主」→ `/about`；Logo 回首页。园主页展示履历时间轴、能力摘要、明文邮箱与社交链接。 |
| **验收标准** | ① 顶栏有「庭院」「园主」 ② Logo 点击回 `/` ③ `/about` 展示履历 ④ 邮箱明文可见 |
| **涉及文件** | `routes.ts`、`Navigation.tsx`、`KnowledgeNav.tsx`、`about/page.tsx`、`AboutGarden.tsx` |
| **依赖** | 无 |

### WI-A2 · 全站 Footer

| 字段 | 内容 |
|------|------|
| **标题** | 全站 Footer（含明文邮箱） |
| **优先级** | P0 |
| **描述** | Q3A：抽取 `SiteFooter`，在 `SpiritAtmosphereShell` 挂载；首页移除重复 Footer。 |
| **验收标准** | ① 子页与知识库页脚可见 ② 邮箱 `mailto:` 明文展示 ③ GitHub 链到真实仓库 |
| **涉及文件** | `SiteFooter.tsx`、`SpiritAtmosphereShell.tsx`、`SpiritGardenHome.tsx` |
| **依赖** | WI-A1（园主链接） |

### WI-A3 · 首页 CTA

| 字段 | 内容 |
|------|------|
| **标题** | 首页 Hero「了解我」→ `/about` |
| **优先级** | P0 |
| **描述** | Hero 双路径：探寻作品 → `/projects`；了解我 → `/about`。 |
| **验收标准** | 点击「了解我」进入园主页，非页内滚动 |
| **涉及文件** | `SpiritGardenHome.tsx` |
| **依赖** | WI-A1 |

### WI-A4 · 社交链接配置

| 字段 | 内容 |
|------|------|
| **标题** | 替换 `personal.ts` 社交占位 |
| **优先级** | P0 |
| **描述** | GitHub 改为真实仓库；无确切信息的 LinkedIn/Twitter 移除占位。 |
| **验收标准** | 无 `yourusername`；GitHub 可打开 |
| **涉及文件** | `personal.ts` |
| **依赖** | 无 |

### WI-A5 · 项目详情（Supabase）

| 字段 | 内容 |
|------|------|
| **标题** | 扩展 `all_projects` + `/projects/[slug]` |
| **优先级** | P0 |
| **描述** | Q4A：SQL 增加 slug、body、highlights、tech_stack、period、role、is_featured；详情页 Server 渲染；列表卡片跳转详情。 |
| **验收标准** | ① SQL 补丁可执行 ② 每项目有 slug URL ③ OG metadata 正确 ④ RAG 来源 URL 指向详情页 |
| **涉及文件** | `patch-phase-a-all-projects-detail.sql`、`allProjects.ts`、`queries.ts`、`actions.ts`、`projects/[slug]/page.tsx`、`AllProjects.tsx` |
| **依赖** | Supabase 执行 SQL |

### WI-A6 · 知识库公开策略

| 字段 | 内容 |
|------|------|
| **标题** | `kb_records.is_public` + RLS + 录入 UI |
| **优先级** | P0 |
| **描述** | Q2A：记录级公开开关；RLS 允许匿名读 `is_public=true`；QuickRecord / Edit 增加开关。 |
| **验收标准** | ① 默认私有 ② 公开项匿名 SELECT 成功 ③ 私有项匿名不可读 |
| **涉及文件** | `patch-phase-a-kb-is-public.sql`、`types.ts`、`actions.ts`、`QuickRecordModal.tsx`、`EditRecordModal.tsx` |
| **依赖** | Supabase 执行 SQL |

### WI-A7 · RAG 索引闭环

| 字段 | 内容 |
|------|------|
| **标题** | RAG 仅索引公开知识库 + 项目详情 URL |
| **优先级** | P0 |
| **描述** | `indexer.ts` 过滤 `is_public`；项目文档 url 改为 `/projects/[slug]`。 |
| **验收标准** | ① `pnpm rag:index` 无 kb skip warn（公开项存在时）② 助手来源链到详情 |
| **涉及文件** | `indexer.ts` |
| **依赖** | WI-A5、WI-A6、Supabase SQL |

---

## 执行顺序

```
WI-A4 ─┬─ WI-A1 ─ WI-A2 ─ WI-A3
       │
WI-A5 ─┴─ WI-A7
WI-A6 ───── WI-A7
```

## 自测清单

| # | 场景 | 期望 |
|---|------|------|
| T1 | 顶栏 Tab | 有「庭院」「园主」 |
| T2 | `/about` | 履历 + 明文邮箱 |
| T3 | 子页 Footer | 邮箱可见 |
| T4 | `/projects/{slug}` | 详情正常；404 对无效 slug |
| T5 | 知识库公开开关 | 公开后 anon 可读 |
| T6 | `pnpm lint && pnpm typecheck && pnpm build` | 通过 |

## 云效验收点回填（Epic 级）

1. 导航 IA 符合 Q5B；园主页可访问且信息完整
2. 全站 Footer 明文邮箱（Q3A）
3. 项目详情来自 Supabase（Q4A），可分享 URL
4. 知识库 `is_public` 策略落地（Q2A），RAG 可索引公开项
5. lint / typecheck / build 通过
