# Phase B 云效工作项拆分

> 日期：2026-06-11  
> 依据：[product-design-optimization.md](./product-design-optimization.md) §7 Phase B  
> 状态：**代码已落地**（需 Supabase SQL + rag:index）

---

## Epic：Phase B — 内容深度

| ID | 标题 | 状态 |
|----|------|------|
| WI-B1 | vibe 长文合并（Q1B） | ✅ |
| WI-B2 | 助手情境欢迎 + 来源深链 | ✅ |
| WI-B3 | 项目精选筛选 + Featured 管理 | ✅ |
| WI-B4 | 知识库公开详情 `/knowledge/[id]` | ✅ |
| WI-B5 | RAG 索引 vibe 公开长文 | ✅ |

---

## WI-B1 · 草本集长文（Q1B）

**交付**：
- SQL：`patch-phase-b-vibe-entries.sql`（kind / slug / body / is_public / tags）
- 种子：`seed-phase-b-blog-to-vibe.sql`（blogPosts → article）
- 路由：`/vibe/[slug]`
- UI：类型筛选（实验/笔记/长文）、录入 Modal 扩展

**验收**：无独立 `/writing`；长文可阅读；公开长文可被 RAG 索引

---

## WI-B2 · RAG 情境化

**交付**：
- `lib/rag/pageContext.ts` — 按路由切换欢迎语与建议问题
- `SourceList` — 站内来源用 `Link` 深链

---

## WI-B3 · 项目精选

**交付**：
- `AddAllProjectModal` — 「首页精选」checkbox
- `AllProjects` — 「精选」筛选；Bento 优先 `isFeatured` 项目

---

## WI-B4 · 知识库公开详情

**交付**：
- `fetchPublicKbRecord(id)` — 仅 `is_public=true`
- `/knowledge/[id]` — 匿名可读只读页
- RAG 来源 URL → `/knowledge/{id}`

---

## Supabase 执行顺序（Phase B）

1. `patch-phase-b-vibe-entries.sql`
2. `seed-phase-b-blog-to-vibe.sql`（可选）
3. `pnpm rag:index`

---

## 自测清单

| # | 场景 | 期望 |
|---|------|------|
| T1 | `/vibe` 筛选「长文」 | 可见迁移文章 |
| T2 | `/vibe/{slug}` | Markdown 正文渲染 |
| T3 | `/projects` 筛选「精选」 | 仅 isFeatured 项目 |
| T4 | `/knowledge/{id}`（公开记录） | 匿名可读 |
| T5 | 助手在 `/projects` | 欢迎语与建议问题变化 |
| T6 | 助手回答来源 | 点击跳转详情页 |
