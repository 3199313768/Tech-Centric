# 项目状态与未完成项审查

> 审查日期：2026-06-11  
> 仓库：`Tech-Centric`（Next.js 16 + Supabase + SpiritGarden）  
> 对照来源：代码库、`docs/product/` PRD、`docs/superpowers/` 设计与计划、`scripts/README.md`、工程规范 C4 历史债

---

## 1. 总览

| 模块 | 状态 | 说明 |
|------|------|------|
| 站点子页（projects / skills / vibe / resources） | ✅ 可用 | Supabase CRUD + SpiritGarden UI |
| 知识库 `/knowledge` | ✅ MVP 完成 | CRUD、标签、分页、全局 Cmd+K 录入 |
| 公开 RAG 助手 | ✅ 核心完成 | 首页浮动助手 + Ask / Contact 双模式 |
| SpiritGarden 暖色主题 | ✅ 基本完成 | 全局 token + 子页样式 |
| 移动端导航 / RAG 样式收敛 | 🔄 进行中 | 工作区有未提交改动（见 §2） |
| RAG × 知识库索引闭环 | ❌ 未闭环 | RLS 与索引策略矛盾（见 §3.1） |
| 自动化测试 | ❌ 缺失 | 无 unit / e2e 套件 |
| 独立联系聊天气泡页 | ❌ 未实现 | 归档设计未落地（见 §7） |

本地门禁：`pnpm typecheck` 已通过；提交前仍应跑 `pnpm lint && pnpm build`。

---

## 2. 工作区进行中（未提交）

当前 `git status` 显示 10 个文件有本地修改，尚未 commit：

| 文件 | 改动方向 |
|------|----------|
| `src/app/globals.css` | 新增/扩展 `sg-nav-drawer`、`sg-rag-*` 等 SpiritGarden 样式（约 +596 行） |
| `src/components/home/shell/Navigation.tsx` | 紧凑屏（≤1024px）抽屉导航 + overlay |
| `src/components/rag/shell/FloatingAssistant.tsx` | 由内联 Tailwind 改为 `sg-rag-*` class |
| `src/components/rag/chat/*`、`contact/*` | RAG 面板与联系模式样式对齐设计系统 |
| `src/utils/useBreakpoint.ts` | 断点 hook 优化（SSR 首屏默认值、监听收敛） |

**待完成动作**：自测移动端导航与 RAG 面板、跑 `pnpm lint && pnpm build`、合并提交。

---

## 3. 功能与架构缺口（建议优先处理）

### 3.1 RAG 无法索引私密知识库记录（P0）

**现象**：`src/lib/rag/indexer.ts` 用 **anon** 客户端读取 `kb_records`；`docs/setup/SupabaseSetup.sql` 中 RLS 为 `auth.uid() = user_id`，匿名无法读任何记录。索引时会出现 warn 并跳过：

```text
Skipping kb_records ingestion because no public records are readable
```

**影响**：助手只能回答静态种子数据 + `all_projects`（`is_public=true`），**无法**把 `/knowledge` 录入内容纳入 RAG。

**可选方案**（需产品决策）：

1. 知识库增加 `is_public` / `publish` 字段 + RLS 允许匿名读公开记录；索引仅收录公开项。
2. 索引脚本改用 `SUPABASE_SERVICE_ROLE_KEY` 读取全库（仍应在应用层过滤可公开字段）。
3. 放弃「知识库进 RAG」，仅索引静态数据（与 PRD「公开助手」目标冲突）。

相关开放问题见 `docs/superpowers/specs/2026-06-09-public-rag-assistant-design.md` §Open Questions。

### 3.2 `projects` 表未纳入 RAG 索引（P1）

`indexer.ts` 对 `projects` 表显式 `console.warn` 跳过，直到表具备明确的公开可见性字段。当前仅索引 `all_projects.is_public = true`。

### 3.3 知识库变更后不自动重建 RAG 索引（P1）

`src/lib/knowledge/actions.ts` 在增删改后只 `revalidatePath('/knowledge')`，**不**调用 `rag:index` 或 `/api/rag/reindex`。新建/编辑知识条目后，助手答案不会自动更新。

**待决**：手动 `pnpm rag:index`、受保护 reindex API、或在 Server Action 后异步触发（注意成本与限流）。

### 3.4 浮动助手仅挂载在首页（P2）

`SiteShell.tsx` 仅在 `pathname === '/'` 时渲染 `FloatingAssistant`。子页（projects、resources 等）访客无法使用助手与联系模式。

设计文档 `assistant-contact-mode-design` 目标是「统一入口」；若需全站可用，应将助手提升到 `(site)` layout 或按需显示。

### 3.5 Supabase 推荐补丁可能未在生产执行（P1）

代码已支持 RPC/分布式限流，但依赖 SQL 补丁是否在目标环境执行：

| 脚本 | 用途 | 未部署时的行为 |
|------|------|----------------|
| `scripts/sql/patch-kb-user-tags-rpc.sql` | 标签聚合 `get_kb_user_tags` | 回退为客户端分页扫描全库 tags |
| `scripts/sql/patch-rag-rate-limit.sql` | `check_rag_rate_limit` | 回退为进程内 `Map` 限流（多实例不可靠） |

执行顺序见 `scripts/README.md`。

### 3.6 RAG 运行时依赖环境变量（运维）

README 已列清单；缺任一关键项会导致聊天或索引失败：

- `OPENAI_API_KEY`、`DEEPSEEK_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`（索引 / reindex）
- `RAG_REINDEX_SECRET`（受保护 reindex）
- 国内环境可能需要 `HTTPS_PROXY`（见 README §官方 OpenAI + 本地代理）

索引前必须：`pnpm rag:check` → `pnpm rag:index`。

---

## 4. 产品 Backlog（PRD / 交付文档 To-be）

来源：[knowledge-prd.md](./knowledge-prd.md)、[knowledge-issues.md](./knowledge-issues.md)、[knowledge-walkthrough.md](../delivery/knowledge-walkthrough.md)。

| 优先级 | 项 | 状态 |
|--------|-----|------|
| P1 | 标签 RPC 聚合（替代客户端全表扫描） | 代码 + SQL 已有；部署 RPC 即完成 |
| P2 | Code 类型显式语言字段（非 highlight 自动推断） | 未实现 |
| P2 | 知识库图片改用 `next/image`（`RecordCard` 等仍用 `<img>`） | 未实现 |
| P3 | 图片 OCR 自动打标签 | 交付文档延伸，未规划实现 |
| P3 | 知识库内嵌在线运行沙盒 | 交付文档延伸，未规划实现 |

知识库 MVP 严重项（CRUD、标签过滤、移动端 FAB、`alert` 替换等）已在 [knowledge-issues.md](./knowledge-issues.md) 标为 ✅。

---

## 5. 内容与配置占位

| 项 | 位置 | 说明 |
|----|------|------|
| 社交链接占位 | `src/data/site/personal.ts` | `github.com/yourusername`、`linkedin`、`twitter` 仍为模板 URL |
| 知识库入口 | 主导航 `SITE_NAV_TABS` | 无 `/knowledge` Tab；仅首页 `SpiritGardenHome`「档案馆」链接 + 直接访问 URL |
| 匿名写 RLS | `scripts/sql/patch-projects-rls-write.sql` | 个人站临时用；生产慎用，需确认是否已按需启用 |

---

## 6. 工程质量与历史债

| 项 | 说明 |
|----|------|
| 自动化测试 | `package.json` 无 test 脚本；仓库内无 `*.test.*` / Playwright 配置 |
| 代码风格债 | 规范 C4：历史组件引号/分号混用；触达区域逐步收敛 |
| `KbRecord` 索引签名 | `types.ts` 含 `[key: string]: unknown`，类型较宽 |
| CI | `.github/workflows/ci.yml` 已配置 lint + typecheck + build（占位 Supabase env） |
| Superpowers 计划文档 | `docs/superpowers/plans/*.md` 内 checkbox 仍为 `- [ ]`，**不代表**代码未实现；以本文件与代码为准 |

---

## 7. 归档设计未落地项

[archive/contact-chat-redesign.md](../archive/contact-chat-redesign.md) 规划了独立 `ContactChat.tsx` 全页聊天气泡联系流程（打字动画、微信二维码、社交卡片等）。

**现状**：

- 仓库中 **不存在** `ContactChat` 组件。
- 联系能力已实现在 **浮动助手 Contact Mode**（`lib/rag/contactFlow.ts` + `components/rag/contact/*`）。
- `assistant-contact-mode-design` 明确 v1 **保留**原联系页、不删导航入口——但原联系页/组件本身从未按归档稿实现。

若需要独立「联系」Tab 或全屏聊天页，需重新立项或从归档稿拆任务。

---

## 8. RAG / 助手：刻意不在 v1 的范围（Non-Goals）

以下在设计中标为 **Non-Goals**，不算缺陷，除非产品升版：

- 独立 `/ask` 页面
- 访客聊天记录持久化（刷新丢失）
- Contact 数据写入 Supabase / 后端发邮件
- 用 LLM 改写联系邮件正文
- 专用外部向量库

---

## 9. 建议执行顺序

1. **合并 §2 未提交改动**并完成移动端自测。
2. **决策并实施 §3.1**（知识库与 RAG 数据策略）——阻塞「助手懂知识库」。
3. **在生产 Supabase 执行推荐 SQL 补丁** + `pnpm rag:check` + `pnpm rag:index`。
4. **替换 `personal.ts` 社交占位链接**。
5. 按 PRD 处理 P2（代码语言、图片优化）。
6. 评估全站助手（§3.4）与自动 reindex（§3.3）。
7. 中长期：测试体系、OCR/沙盒等 P3。

---

## 10. 相关文档索引

| 文档 | 用途 |
|------|------|
| [knowledge-prd.md](./knowledge-prd.md) | 知识库 As-is / To-be |
| [knowledge-issues.md](./knowledge-issues.md) | 知识库问题修复记录 |
| [knowledge-walkthrough.md](../delivery/knowledge-walkthrough.md) | 知识库 MVP 交付说明 |
| [scripts/README.md](../../scripts/README.md) | SQL 顺序与 RAG 命令 |
| [前端代码规范.md](../engineering/前端代码规范.md) | 工程规范与 C4 历史债 |
| `docs/superpowers/specs/` | RAG、Contact Mode 设计规格 |
| `docs/superpowers/plans/` | 实现计划（过程文档） |

---

*本文件由代码审查生成，后续功能合入或 PRD 变更时请同步更新「审查日期」与对应章节。*
