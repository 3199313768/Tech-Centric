# RAG Quality, Citations, Evaluation, and Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the public RAG assistant with hybrid retrieval, validated citations, a repeatable evaluation suite, and anonymous helpfulness feedback.

**Architecture:** Preserve OpenAI Embeddings, Supabase pgvector, DeepSeek, and SSE. Add a lexical Supabase RPC, fuse vector and lexical candidates with pure TypeScript RRF logic, validate request-local citation IDs after generation, persist server-owned response snapshots, and accept anonymous feedback referencing those snapshots.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase/PostgreSQL, pgvector, DeepSeek SSE, Vitest, Playwright, pnpm.

---

## Working-tree constraint

The workspace contains user-owned uncommitted changes in RAG and shared provider files. Before each task run `git status --short` and inspect the target-file diff. Never reset, overwrite, stage, or commit unrelated changes. Stage only the files explicitly listed in each task.

## File map

Create:

- `vitest.config.ts`
- `src/lib/rag/fusion.ts` and `fusion.test.ts`
- `src/lib/rag/citations.ts` and `citations.test.ts`
- `src/lib/rag/retrieval.test.ts`
- `src/lib/rag/deepseek.test.ts`
- `src/lib/rag/protocol.ts` and `protocol.test.ts`
- `src/lib/rag/feedback.ts` and `feedback.test.ts`
- `src/app/api/rag/feedback/route.ts`
- `src/components/rag/chat/AnswerFeedback.tsx`
- `src/lib/rag/evaluation/types.ts`, `cases.ts`, `scoring.ts`, and `scoring.test.ts`
- `scripts/rag/evaluate-rag.ts`
- `scripts/sql/patch-rag-hybrid-search-feedback.sql`
- `e2e/rag-feedback.spec.ts`

Modify:

- `package.json`, `pnpm-lock.yaml`
- `src/lib/rag/types.ts`, `retrieval.ts`, `deepseek.ts`, `rateLimit.ts`
- `src/app/api/rag/chat/route.ts`
- `src/components/rag/chat/ChatPanel.tsx`, `MessageBubble.tsx`, `SourceList.tsx`
- `src/app/globals.css`

---

### Task 1: Add the unit-test harness

**Files:** `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, `src/lib/rag/fusion.test.ts`

- [ ] Install Vitest: `pnpm add -D vitest`.
- [ ] Add scripts: `"test:unit": "vitest run"` and `"test:unit:watch": "vitest"` while preserving existing package changes.
- [ ] Create `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
```

- [ ] Write a failing `fusion.test.ts` importing `fuseRagCandidates` and expecting empty channels to return `{ candidates: [], evidenceMode: 'insufficient' }`.
- [ ] Run `pnpm test:unit -- src/lib/rag/fusion.test.ts`; verify failure is “module not found”, not a test syntax error.
- [ ] Commit: `test(rag): 增加质量评测单元测试框架`.

### Task 2: Implement RRF fusion, diversity, and confidence

**Files:** `src/lib/rag/types.ts`, `src/lib/rag/fusion.ts`, `src/lib/rag/fusion.test.ts`

- [ ] Add failing tests proving: a candidate present in both channels ranks first; one document contributes at most two chunks; page context only breaks close ties; empty/weak evidence is `insufficient`; cross-channel evidence is `site`.
- [ ] Add these types:

```ts
export type RagPageContext = 'projects' | 'skills' | 'knowledge' | 'resources' | 'vibe' | 'about' | 'showcase' | 'search' | 'stats'
export interface RagRetrievalCandidate {
  chunkId: string; documentId: string; sourceId: string; content: string
  excerpt: string; title: string; url: string | null; sourceType: RagSourceType
  tags: string[]; similarity: number | null; lexicalRank: number | null
}
export interface FusedRagCandidate extends RagRetrievalCandidate {
  fusedScore: number
  matchedChannels: Array<'vector' | 'lexical'>
}
export type RagEvidenceMode = 'site' | 'insufficient' | 'general'
```

- [ ] Implement `fuseRagCandidates({ vector, lexical, pageContext })` with `1 / (60 + rank)`, a `0.002` bounded page boost, maximum eight chunks, and maximum two chunks per document.
- [ ] Run `pnpm test:unit -- src/lib/rag/fusion.test.ts` and `pnpm typecheck`; both must pass.
- [ ] Commit: `feat(rag): 增加混合检索融合与置信度判断`.

### Task 3: Implement exact citation validation

**Files:** `src/lib/rag/types.ts`, `src/lib/rag/citations.ts`, `src/lib/rag/citations.test.ts`

- [ ] Write failing tests for stable `S1` IDs, cited-source filtering, repeated citation deduplication, unknown-ID removal, and conversion from `[S2]` to visitor-facing `[1]`.
- [ ] Add:

```ts
export interface RagContextSource extends FusedRagCandidate {
  contextId: `S${number}`
}
export interface RagSource {
  citation: number; sourceId: string; title: string; url: string | null
  sourceType: RagSourceType; excerpt: string
}
```

- [ ] Implement `assignContextIds(candidates)` and `finalizeCitations(rawAnswer, contexts)`. Parse `/\[S(\d+)\]/g`, remove invalid markers, and number valid sources in first-use order.
- [ ] Verify with `pnpm test:unit -- src/lib/rag/citations.test.ts && pnpm typecheck`.
- [ ] Commit: `feat(rag): 校验回答引用并过滤无关来源`.

### Task 4: Add lexical retrieval and channel degradation

**Files:** `scripts/sql/patch-rag-hybrid-search-feedback.sql`, `src/lib/rag/retrieval.ts`, `src/lib/rag/retrieval.test.ts`

- [ ] Write failing tests for both channels succeeding, vector-only fallback, lexical-only fallback, and both channels failing.
- [ ] Add SQL RPC `match_rag_chunks_lexical(query_text text, match_count integer default 12)` returning chunk/document/source identity, content, title, URL, source type, tags, and lexical rank.
- [ ] Use `websearch_to_tsquery('simple', query_text)`, `ts_rank_cd`, plus lower-case title/tag substring bonuses. Filter `is_public = true`; revoke public execution; grant only `service_role`.
- [ ] In the same additive patch, replace the vector RPC return shape to include `source_id`.
- [ ] Export:

```ts
matchRagChunksVector(embedding, count?)
matchRagChunksLexical(query, count?)
retrieveRagCandidates(query, embedding, dependencies?)
```

- [ ] Use `Promise.allSettled`; allow one failed channel and throw `RAG retrieval failed` only if both fail.
- [ ] Run `pnpm test:unit -- src/lib/rag/retrieval.test.ts`, `pnpm typecheck`, and `git diff --check`.
- [ ] Commit: `feat(rag): 增加全文检索与双通道降级`.

### Task 5: Make generation citation-aware

**Files:** `src/lib/rag/deepseek.ts`, `src/lib/rag/deepseek.test.ts`

- [ ] Write failing tests showing the prompt contains `[S1]`, forbids unknown IDs, requires citations after site-backed claims, labels sources untrusted, omits similarity percentages, and adds the insufficient-coverage instruction when required.
- [ ] Change the prompt API to:

```ts
buildRagMessages(message, contexts: RagContextSource[], evidenceMode: RagEvidenceMode)
streamRagAnswer(message, contexts: RagContextSource[], evidenceMode: RagEvidenceMode)
```

- [ ] Format each context as identifier, title, type, tags, and content. Preserve current DeepSeek model, proxy, timeout, and SSE behavior.
- [ ] Run `pnpm test:unit -- src/lib/rag/deepseek.test.ts && pnpm typecheck`.
- [ ] Commit: `feat(rag): 要求站内事实生成精确引用`.

### Task 6: Add server-owned response snapshots and feedback API

**Files:** SQL patch, `src/lib/rag/feedback.ts`, `feedback.test.ts`, `src/app/api/rag/feedback/route.ts`, `src/lib/rag/rateLimit.ts`

- [ ] Write failing tests accepting only `{ responseId, sessionId, helpful, reason? }`; reject malformed UUIDs, missing negative reasons, unknown reasons, and extra question/answer/source/IP/email/user-agent fields.
- [ ] Extend SQL with `rag_responses` and `rag_feedback`, RLS enabled, no anonymous direct access, foreign key to response, and unique `(response_id, session_id)`.
- [ ] Implement:

```ts
parseRagFeedbackPayload(value)
saveRagResponseSnapshot(snapshot)
upsertRagFeedback(input): Promise<'saved' | 'missing-response'>
```

- [ ] Generalize the existing rate limiter with `chat` and `feedback` namespaces; keep `isRagChatRateLimited` and add `isRagFeedbackRateLimited` at 30 updates/minute.
- [ ] Implement `POST /api/rag/feedback`: body cap, limiter, allowlisted validation, response existence check, `204/400/404/429/500` statuses, safe errors.
- [ ] Run `pnpm test:unit -- src/lib/rag/feedback.test.ts && pnpm typecheck`.
- [ ] Commit: `feat(rag): 增加匿名回答反馈存储`.

### Task 7: Upgrade chat orchestration and SSE protocol

**Files:** `src/lib/rag/protocol.ts`, `protocol.test.ts`, `src/lib/rag/types.ts`, `src/app/api/rag/chat/route.ts`

- [ ] Write failing tests for event encoding and these exact shapes:

```ts
type RagSseEvent =
  | { type: 'meta'; responseId: string }
  | { type: 'delta'; text: string }
  | { type: 'done'; answer: string; sources: RagSource[]; evidenceMode: RagEvidenceMode; retrievalMs: number; firstTokenMs: number | null; totalMs: number }
  | { type: 'error'; error: string }
```

- [ ] Implement `encodeRagSse`; ensure `meta` contains no candidate sources.
- [ ] Refactor the route to validate optional `pageContext`, create `crypto.randomUUID()`, embed, retrieve both channels, fuse, assign context IDs, stream deltas, measure first token, finalize citations, emit authoritative `done`, and save the response snapshot.
- [ ] Snapshot-write failure must be logged but must not invalidate a successful answer. Logs must not contain IP, keys, contact details, or raw provider bodies.
- [ ] Run `pnpm test:unit && pnpm typecheck`.
- [ ] Commit: `feat(rag): 流式返回精确引用与质量指标`.

### Task 8: Add feedback and cited-source UI

**Files:** `AnswerFeedback.tsx`, `ChatPanel.tsx`, `MessageBubble.tsx`, `SourceList.tsx`, `types.ts`, `globals.css`, `e2e/rag-feedback.spec.ts`

- [ ] First write a failing Playwright test that mocks chat SSE and feedback API. Assert only `done.sources` render, `[1]` and excerpt appear, similarity percentages do not, positive feedback posts only allowed fields, negative feedback posts a supported reason, and contact messages have no feedback actions.
- [ ] Extend chat messages with optional `responseId`, `evidenceMode`, and `isComplete` fields.
- [ ] Send constrained page context; create/read `tech-centric-rag-session-id` in local storage; consume `meta/delta/done`; apply authoritative normalized answer and sources on `done`.
- [ ] Build `AnswerFeedback` with `idle/submitting/saved/error`, `aria-pressed`, keyboard-accessible reasons, polite status text, retry, and an anonymous-use notice.
- [ ] Localize source types, show citation number and excerpt, and remove all raw similarity UI.
- [ ] Add only `sg-*` styles using existing `var(--sg-*)` tokens; no hex colors.
- [ ] Run `pnpm test:e2e -- e2e/rag-feedback.spec.ts --project=chromium`, `pnpm test:unit`, and `pnpm typecheck`.
- [ ] Commit: `feat(rag): 增加精确来源与匿名反馈交互`.

### Task 9: Add the 30-case golden dataset

**Files:** `src/lib/rag/evaluation/types.ts`, `cases.ts`, `scoring.ts`, `scoring.test.ts`

- [ ] Write failing tests for unique IDs, at least 30 cases, all six categories, citation cases declaring expected sources, safety cases declaring forbidden terms, and independent metric calculations.
- [ ] Define categories `known_fact`, `exact_term`, `multi_source`, `unsupported`, `safety`, and `language_variant`.
- [ ] Each case includes question, expected source types/IDs, required and forbidden terms, expected insufficient flag, citation requirement, and refusal expectation.
- [ ] Derive facts and IDs from current public data only; include Chinese/English pairs and prompt-injection cases.
- [ ] Implement term-based deterministic scoring; do not add model-judged evaluation.
- [ ] Run `pnpm test:unit -- src/lib/rag/evaluation/scoring.test.ts && pnpm typecheck`.
- [ ] Commit: `test(rag): 增加黄金问题集与质量评分`.

### Task 10: Add the opt-in online evaluator

**Files:** `scripts/rag/evaluate-rag.ts`, `package.json`

- [ ] Add `rag:evaluate` using the project’s existing `ts-node` CommonJS invocation; run it first and confirm failure because the file is missing.
- [ ] Preflight `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` before any paid call.
- [ ] Sequentially embed, retrieve, fuse, generate non-streaming output, finalize citations, score, and print one PASS/FAIL line per case.
- [ ] Print source-hit rate, valid-citation rate, insufficient-recognition rate, safe-refusal rate, and average retrieval/first-token/total latency.
- [ ] Exit non-zero below 85% source hit, below 90% valid citations, or on any failed safety refusal.
- [ ] Run `pnpm test:unit && pnpm typecheck`. Run `pnpm rag:evaluate` only when credentials and SQL are available; otherwise record the exact blocker without claiming success.
- [ ] Commit: `feat(rag): 增加在线质量评测命令`.

### Task 11: Database and full verification

**Files:** all changed files

- [ ] Apply `scripts/sql/patch-rag-hybrid-search-feedback.sql` through the established Supabase workflow when authority is available. Confirm `match_rag_chunks_lexical`, updated vector RPC, `rag_responses`, and `rag_feedback` exist.
- [ ] Run:

```bash
pnpm test:unit
pnpm test:e2e -- e2e/rag-feedback.spec.ts --project=chromium
pnpm lint
pnpm typecheck
pnpm build
```

- [ ] If prerequisites exist, run `pnpm rag:evaluate` and confirm source hit ≥85%, valid citations ≥90%, and zero safety failures.
- [ ] Manually verify exact-name search, unsupported questions, citation/source alignment, feedback create/update, feedback payload privacy, unchanged contact flow, and single-channel degradation.

### Task 12: Project-mandated closeout

**Files:** PR draft, completion report, real screenshots, optional documentation indexes

- [ ] Invoke `tsc-check` and run `pnpm exec tsc --noEmit` until zero errors without `any`, `@ts-ignore`, or `@ts-expect-error`.
- [ ] Invoke `pr-prep`; inspect `git diff main...HEAD --stat`, commits, new `console.log/debug`, and new `TODO/FIXME/HACK/XXX`.
- [ ] Capture real UI screenshots for a cited answer, negative-feedback reasons, and saved feedback under `docs/完成报告/AI/RAG公开助手/20260720/截图/RAG质量反馈闭环/`.
- [ ] Write `docs/PR描述草稿/AI/RAG公开助手/20260720/PR-RAG质量反馈闭环.md`.
- [ ] Write the rigid eight-section report at `docs/完成报告/AI/RAG公开助手/20260720/报告-RAG质量反馈闭环.md`; derive the file table from `git diff main...HEAD --stat`.
- [ ] Update `docs/README.md` and `docs/工作台账.md` only if they exist. If the project taxonomy files are absent, document that fact instead of fabricating an index.
- [ ] Run `git diff --check` and inspect `git status --short` before the final documentation commit.
- [ ] Do not push or create a PR without a separate user request.

