# Scripts

维护脚本与 Supabase 初始化 SQL。知识库表结构见 [docs/setup/SupabaseSetup.sql](../docs/setup/SupabaseSetup.sql)。

## 目录

| 路径 | 说明 |
|------|------|
| [sql/](./sql/) | Supabase 建表、种子数据、RLS 补丁 |
| [rag/](./rag/) | RAG 环境检查与索引（由 `package.json` 调用） |
| [codegen/](./codegen/) | 从 `src/data` 生成 SQL 的脚本 |

## Supabase 执行顺序（站点数据）

在 SQL Editor 中按序执行（按需跳过已有表）：

1. [docs/setup/SupabaseSetup.sql](../docs/setup/SupabaseSetup.sql) — 知识库 `kb_records`
2. [sql/patch-kb-user-tags-rpc.sql](./sql/patch-kb-user-tags-rpc.sql) — 标签聚合 RPC（推荐）
3. [sql/patch-rag-rate-limit.sql](./sql/patch-rag-rate-limit.sql) — RAG 聊天分布式限流（推荐）
4. [sql/setup-projects-db.sql](./sql/setup-projects-db.sql) — `projects` / `all_projects`
5. [sql/seed-projects.sql](./sql/seed-projects.sql) — 项目种子数据（可选）
6. [sql/patch-projects-rls-write.sql](./sql/patch-projects-rls-write.sql) — 匿名写权限（个人站临时用，生产慎用）
7. [sql/setup-ai-skills.sql](./sql/setup-ai-skills.sql)
8. [sql/setup-vibe-coding.sql](./sql/setup-vibe-coding.sql)
9. [sql/setup-resources.sql](./sql/setup-resources.sql) — 或用下方 codegen 重新生成
10. [sql/setup-rag.sql](./sql/setup-rag.sql) — RAG 向量表与 RPC

## RAG

```bash
pnpm rag:check   # 验证 embedding 环境
pnpm rag:index   # 重建索引
```

## 生成 resources SQL

从 `src/data/resources/initialResources.ts` 重新生成 `sql/setup-resources.sql`：

```bash
pnpm sql:resources
```
