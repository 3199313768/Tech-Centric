# 项目状态与未完成项审查

> 审查日期：2026-06-11（UI 创意优化三轮交付）  
> 最近提交：工作区 — UI 创意优化 Phase 1–3（见 §2.3）  
> 仓库：`Tech-Centric`（Next.js 16 + Supabase + SpiritGarden）

对照来源：代码库、`docs/product/` PRD、`docs/superpowers/` 设计与计划、`scripts/README.md`、工程规范 C4。

---

## 1. 总览

| 模块 | 状态 | 说明 |
|------|------|------|
| 站点子页（projects / skills / vibe / resources） | ✅ | Supabase CRUD + SpiritGarden UI |
| 知识库 `/knowledge` | ✅ MVP | CRUD、标签、分页、全局 Cmd+K 录入 |
| 公开 RAG 助手 | ✅ 核心 | 全站浮动助手（庭院导引），Ask / Contact 双模式 |
| SpiritGarden 暖色主题 | ✅ | 全局 token + 子页场景化 + 氛围层 |
| UI 创意优化 | ✅ 三轮 | 见 [ui-creative-optimization-proposal.md](./ui-creative-optimization-proposal.md) §5 |
| 移动端导航 | ✅ | ≤1024px 抽屉 + overlay + Esc 关闭；顶栏含「档案馆」 |
| RAG 样式与移动端 bottom-sheet | ✅ | 角色化触发器 + 气泡 spring；≤640px 贴底抽屉 |
| 知识库浏览视图 | ✅ | 列表 / 网格切换（桌面）；记录类型场景化 |
| RAG × 知识库索引闭环 | ❌ P0 | RLS 与索引策略矛盾（§3.1） |
| 自动化测试 | ❌ | 无 unit / e2e |
| 独立联系聊天气泡页 | ❌ | 归档设计未落地（§7） |

**本地门禁**（2026-06-11）：`pnpm lint`、`pnpm typecheck`、`pnpm build` 均已通过。

---

## 2. 近期交付记录

### 2.1 已提交（`4bac32f`）

| 范围 | 内容 |
|------|------|
| `src/app/globals.css` | `sg-nav-drawer`、`sg-rag-*` 全套样式 |
| `src/components/home/shell/Navigation.tsx` | 紧凑屏抽屉导航、hydration 修复 |
| `src/components/rag/**` | 问答 / 联系 / 来源列表改用 `sg-rag-*` |
| `src/utils/useBreakpoint.ts` | SSR 首屏默认值、监听收敛 |
| `docs/product/project-status.md` | 首版状态文档 |

### 2.2 工作区待提交（UI 创意优化 Phase 1–3）

| Phase | 范围 | 内容 |
|-------|------|------|
| **1** | 基础设施 | `SpiritAtmosphereShell`、全站助手、档案馆 Tab、首页 Featured 接 DB、RAG 角色化、CSS 氛围层、导航墨迹 |
| **2** | 场景化 | 子页 Hero 动画、列表 exhibit / 墨水条 / 叶片 tag / 书架透视、知识库类型视觉、`useScrollReveal`、`SpiritEmptyState` |
| **3** | 深度创意 | 动态度量仪（`homeStats`）、知识库列表/网格切换、Contact 打字指示器 + 气泡 spring、Hero 季节 overlay |

关键新增文件：`SpiritAtmosphereShell.tsx`、`featured.ts`、`homeStats.ts`、`useScrollReveal.ts`、`SpiritEmptyState.tsx`、`HerbEntry.tsx`、`TypingIndicator.tsx`

设计文档：[ui-creative-optimization-proposal.md](./ui-creative-optimization-proposal.md) · [spec](../superpowers/specs/2026-06-11-ui-creative-optimization-design.md) · [plan](../superpowers/plans/2026-06-11-ui-creative-optimization.md)

---

## 3. 功能与架构缺口（建议优先处理）

### 3.1 RAG 无法索引知识库记录（P0）

`indexer.ts` 用 **anon** 客户端读 `kb_records`；`SupabaseSetup.sql` RLS 为 `auth.uid() = user_id`，匿名不可读。索引时会 warn 并跳过：

```text
Skipping kb_records ingestion because no public records are readable
```

**影响**：助手仅能回答静态种子 + `all_projects`（`is_public=true`），**不能**引用 `/knowledge` 录入内容。

**待决策方案**：

1. `kb_records` 增加 `is_public` + RLS 允许匿名读公开行；索引只收录公开项。
2. 索引脚本用 `SUPABASE_SERVICE_ROLE_KEY` 读库（应用层过滤公开字段）。
3. 放弃知识库进 RAG（与公开助手目标冲突）。

详见 `docs/superpowers/specs/2026-06-09-public-rag-assistant-design.md` §Open Questions。

### 3.2 `projects` 表未纳入 RAG（P1）

`indexer.ts` 显式跳过 `projects`，直至表有公开可见性字段。当前仅索引 `all_projects.is_public = true`。

### 3.3 知识库变更后不自动 reindex（P1）

`lib/knowledge/actions.ts` 仅 `revalidatePath('/knowledge')`，不触发 `rag:index` 或 `/api/rag/reindex`。

### 3.4 ~~浮动助手仅首页~~（已解决）

`SpiritAtmosphereShell` 已在 `(site)` 与 `(knowledge)` 全站挂载 `FloatingAssistant`。

### 3.5 Supabase 推荐补丁（P1，运维）

| 脚本 | 用途 | 未部署时回退行为 |
|------|------|------------------|
| `patch-kb-user-tags-rpc.sql` | `get_kb_user_tags` | 客户端分页扫描 tags |
| `patch-rag-rate-limit.sql` | `check_rag_rate_limit` | 进程内 `Map` 限流 |

执行顺序见 `scripts/README.md`。

### 3.6 RAG 环境变量（运维）

必需：`OPENAI_API_KEY`、`DEEPSEEK_API_KEY`、`NEXT_PUBLIC_SUPABASE_*`、`SUPABASE_SERVICE_ROLE_KEY`、`RAG_REINDEX_SECRET`。国内可能需要 `HTTPS_PROXY`。索引前：`pnpm rag:check` → `pnpm rag:index`。

---

## 4. 产品 Backlog

来源：[knowledge-prd.md](./knowledge-prd.md)、[knowledge-issues.md](./knowledge-issues.md)、[knowledge-walkthrough.md](../delivery/knowledge-walkthrough.md)。

| 优先级 | 项 | 状态 |
|--------|-----|------|
| P1 | 标签 RPC 聚合 | SQL + 代码已有；待 Supabase 部署 |
| P2 | Code 类型显式语言字段 | 未实现 |
| P2 | 知识库图片 `next/image`（`RecordCard` 等仍 `<img>`） | 未实现 |
| P3 | 图片 OCR 自动打标签 | 交付文档延伸 |
| P3 | 知识库内嵌在线沙盒 | 交付文档延伸 |

知识库 MVP 严重项见 [knowledge-issues.md](./knowledge-issues.md)（均已 ✅）。

---

## 5. 内容与配置占位

| 项 | 位置 | 说明 |
|----|------|------|
| 社交链接占位 | `src/data/site/personal.ts` | GitHub / LinkedIn / Twitter 仍为 `yourusername` |
| 知识库入口 | `SITE_NAV_TABS` | 无 `/knowledge` Tab；首页「档案馆」链接 + 直链 |
| 匿名写 RLS | `patch-projects-rls-write.sql` | 个人站临时；生产慎用 |

---

## 6. 工程质量与历史债

| 项 | 说明 |
|----|------|
| 自动化测试 | 无 test 脚本、无 `*.test.*` |
| 代码风格债 | C4：历史组件引号/分号混用 |
| `KbRecord` 宽类型 | `[key: string]: unknown` |
| CI | `.github/workflows/ci.yml`：lint + typecheck + build |
| Superpowers plans | checkbox `- [ ]` 为过程痕迹，以本文件与代码为准 |

---

## 7. 归档设计未落地

[contact-chat-redesign.md](../archive/contact-chat-redesign.md) 规划独立 `ContactChat` 全页气泡联系（打字动画、微信二维码等）。

**现状**：无 `ContactChat` 组件；联系能力在浮动助手 Contact Mode（`lib/rag/contactFlow.ts` + `components/rag/contact/*`）。独立联系 Tab / 全屏页需重新立项。

---

## 8. RAG v1 Non-Goals（非缺陷）

- 独立 `/ask` 页
- 访客聊天持久化
- Contact 写 Supabase / 后端发邮件
- LLM 改写联系邮件
- 专用外部向量库

---

## 9. 建议执行顺序

1. **提交 UI 创意优化 Phase 1–3**（§2.2）并合入 main。
2. **决策 §3.1**（知识库 ↔ RAG 数据策略）——阻塞「助手懂知识库」。
3. **Supabase 执行推荐 SQL** + `pnpm rag:check` + `pnpm rag:index`。
4. **替换 `personal.ts` 社交占位链接**。
5. PRD P2：代码语言字段、`next/image`。
6. 知识库变更后自动 reindex（§3.3）。
7. 中长期：测试体系、OCR / 沙盒等 P3。

---

## 10. 相关文档

| 文档 | 用途 |
|------|------|
| [knowledge-prd.md](./knowledge-prd.md) | 知识库 As-is / To-be |
| [knowledge-issues.md](./knowledge-issues.md) | 知识库问题与修复 |
| [knowledge-walkthrough.md](../delivery/knowledge-walkthrough.md) | MVP 交付说明 |
| [scripts/README.md](../../scripts/README.md) | SQL 顺序与 RAG 命令 |
| [前端代码规范.md](../engineering/前端代码规范.md) | 工程规范与 C4 |
| `docs/superpowers/specs/` | RAG、Contact Mode 设计 |
| `docs/superpowers/plans/` | 实现计划（过程文档） |

---

*功能合入或 PRD 变更时请同步更新「审查日期」与 §1 总览表。*
