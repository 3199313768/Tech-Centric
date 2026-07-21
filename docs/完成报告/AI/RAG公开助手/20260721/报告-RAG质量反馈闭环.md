# RAG 公开助手质量与反馈闭环完成报告

## 1. 需求摘要

本次一次性完成四项 RAG 公开助手优化：混合检索、精确引用、离线质量评测、匿名反馈闭环。目标是提升召回稳定性与回答可核验性，并为后续质量运营提供可量化数据。

## 2. 技术方案

- 检索：并行执行向量检索与 PostgreSQL 全文检索，使用加权 RRF 融合、去重、页面上下文加权与置信度判定；任一通道失败时自动降级，仅双通道均失败才报错。
- 引用：模型使用 `[1]` 形式引用，服务端校验引用编号、过滤未引用来源并输出结构化 SSE 事件；前端展示标题、类型、摘录和安全站内链接。
- 评测：内置 30 条黄金问题，覆盖事实、导航、综合、无答案、安全与联系意图六类；计算引用、召回、拒答、泄露与延迟指标，并提供 `pnpm rag:evaluate` 门禁命令。
- 反馈：回答完成后持久化匿名快照，支持有用/无用反馈；采用原子写入、HMAC 限流标识、请求体限制、RLS 与 90 天自动清理，客户端仅保存匿名会话标识。

## 3. 改动文件清单

本任务直接在 `main` 开发，因此以实施计划提交 `c9e0daf` 为基线整理 RAG 相关文件；同区间内其他功能提交不计入本报告。

- 接口：`src/app/api/rag/chat/route.ts`、`src/app/api/rag/feedback/route.ts`
- 前端：`src/components/rag/chat/AnswerFeedback.tsx`、`ChatPanel.tsx`、`MessageBubble.tsx`、`SourceList.tsx`
- RAG 核心：`src/lib/rag/` 下的 retrieval、fusion、citations、protocol、session、chatState、pageContext、feedback、evaluation、types 等模块及对应单元测试
- 模型客户端：`src/lib/rag/embedding.ts`、`src/lib/deepseek/client.ts`
- 数据库：`scripts/sql/patch-rag-hybrid-search-feedback.sql`
- 评测：`scripts/rag/evaluate-rag.ts`
- 工程配置：`package.json`、`pnpm-lock.yaml`、`vitest.config.ts`
- 设计与计划：`docs/superpowers/specs/2026-07-20-rag-quality-feedback-design.md`、`docs/superpowers/plans/2026-07-20-rag-quality-feedback.md`

## 4. 核心变更说明

1. 检索链路不再依赖单一向量通道；Embedding 供应商故障也被视为向量通道失败，不会阻断全文检索。
2. SSE 协议统一为 `meta`、`delta`、`done`、`error`，以 `done` 作为完整回答的权威终态，并完整传播取消信号。
3. 引用来源由后端校验后下发，前端拒绝非规范内部链接，不展示相似度等容易误导用户的内部指标。
4. 匿名反馈通过服务端回答快照绑定，避免客户端伪造回答内容；限流键不可逆，反馈数据默认保留 90 天。
5. 黄金集与在线评测门禁可持续检测引用完整性、检索命中、安全拒答和凭据泄露风险。

## 5. 截图与视觉说明

按用户要求，本轮未启动应用或执行功能测试，因此未生成运行截图。新增界面包括回答下方的有用/无用反馈控件，以及带编号、类型、标题和摘录的来源列表；需在部署数据库补丁后进行人工视觉验收。

## 6. 自测用例

本轮最终版本未执行功能测试。建议联调时至少覆盖：

- 向量与全文检索均成功、任一通道失败、Embedding 失败、双通道失败。
- 回答包含有效引用、无引用、越界引用、重复引用与低置信度拒答。
- 正常流结束、网络中断、主动取消、缺少 `done` 终态与会话存储降级。
- 首次反馈、重复反馈、超限请求、无效回答 ID 与匿名限流。
- 30 条黄金问题全量评测及各项质量门禁。

## 7. 验收点勾选

- [x] 混合检索与双通道降级代码已实现
- [x] 精确引用校验、结构化传输与来源展示已实现
- [x] 30 条黄金问题、评分逻辑与在线评测命令已实现
- [x] 匿名反馈 UI、API、存储、限流和清理策略已实现
- [x] Embedding 失败时全文检索仍可独立降级
- [ ] Supabase SQL 补丁已在目标环境执行
- [ ] 最终 lint、typecheck、build、单元测试和 E2E 已执行
- [ ] 在线黄金集质量门禁已执行
- [ ] 浏览器视觉与交互已验收

## 8. 验证与后续

- 静态检查：已完成代码审查与 `git diff --check`；未发现残留 Critical/Important 阻断项。
- 运行验证：遵循用户“功能不用进行测试”的要求，最终版本未运行单元测试、E2E、lint、typecheck、build、在线评测或 SQL。开发前段曾运行过局部单元测试，但不作为最终版本通过依据。
- 数据库：部署前必须以具备相应权限的账号执行 `scripts/sql/patch-rag-hybrid-search-feedback.sql`；脚本依赖 Supabase/PostgreSQL 全文检索能力，并尝试启用 `pg_cron` 执行 90 天清理任务。
- 环境变量：在线评测需要 `OPENAI_API_KEY`、`DEEPSEEK_API_KEY`、`NEXT_PUBLIC_SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`；生产环境建议单独配置 `RAG_RATE_LIMIT_SECRET`。
- 建议命令：完成数据库部署后依次执行 `pnpm lint && pnpm typecheck && pnpm build`、`pnpm test:unit`、`pnpm test:e2e`、`pnpm rag:evaluate`。
- PR：未生成。当前改动按用户确认直接提交在 `main`，且最终类型检查未执行，不满足 PR 收尾门禁。
- 工作台账：仓库当前不存在 `docs/工作台账.md`，本轮未擅自创建。

