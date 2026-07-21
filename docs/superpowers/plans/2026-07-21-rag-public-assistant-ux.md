# RAG Public Assistant UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add staged loading feedback, actionable insufficient-evidence exits, and copy/collapse/back-to-top controls for completed RAG answers.

**Architecture:** Keep the existing SSE protocol unchanged. Add pure UI-policy helpers for deterministic tests, small focused client components for loading and answer controls, and minimal state wiring in `ChatPanel` and `MessageBubble`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, SpiritGarden CSS.

---

### Task 1: Define and test UI policy

**Files:**
- Create: `src/lib/rag/chatUi.ts`
- Create: `src/lib/rag/chatUi.test.ts`

- [ ] **Step 1: Write failing tests**

Test that `getNextLoadingStage` advances `understanding → retrieving → generating`, that only completed error-free default assistant answers show answer controls, that insufficient/no-source site answers show exits, and that only answers longer than 600 characters are considered long.

- [ ] **Step 2: Verify RED**

Run `pnpm test:unit src/lib/rag/chatUi.test.ts`; expect failure because `chatUi.ts` does not exist.

- [ ] **Step 3: Implement minimal pure helpers**

Export `RagLoadingStage`, `getNextLoadingStage`, `shouldShowAnswerActions`, `shouldShowInsufficientActions`, and `isLongRagAnswer` with a 600-character threshold.

- [ ] **Step 4: Verify GREEN**

Run `pnpm test:unit src/lib/rag/chatUi.test.ts`; expect all policy tests to pass.

### Task 2: Add staged loading UI

**Files:**
- Create: `src/components/rag/chat/LoadingStatus.tsx`
- Modify: `src/components/rag/chat/ChatPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Wire request lifecycle state**

Set `understanding` at submission, advance to `retrieving` after a short timer, set `generating` on the first SSE `delta`, and clear stage/timer in completion, cancellation, failure, and unmount paths.

- [ ] **Step 2: Render the focused component**

Render three labels with the current/completed states and `aria-live="polite"`, replacing the old single “正在检索站内资料...” row.

- [ ] **Step 3: Add token-based styles**

Use existing `--sg-*` variables and reduced-motion handling; do not add literal colors.

### Task 3: Add answer controls and insufficient exits

**Files:**
- Create: `src/components/rag/chat/AnswerActions.tsx`
- Modify: `src/components/rag/chat/MessageBubble.tsx`
- Modify: `src/components/rag/chat/ChatPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add answer actions component**

Render copy for every eligible answer. For long answers, default to expanded and render collapse/expand plus back-to-top. When insufficient actions are eligible, link to `/projects` and `/knowledge`, and invoke `contact:start` for contact.

- [ ] **Step 2: Preserve original content and scrolling scope**

Apply a six-line CSS clamp only while collapsed. Attach a ref to the current answer bubble so back-to-top scrolls that answer into view.

- [ ] **Step 3: Reuse copy feedback**

Move clipboard fallback responsibility to `ChatPanel` via an answer-copy callback so the existing toast reports “回答已复制”.

- [ ] **Step 4: Add accessible styles**

Use button/link elements, focus-visible states, accessible labels, and SpiritGarden tokens.

### Task 4: Verify the feature

**Files:**
- Modify only files required by failures introduced by this feature.

- [ ] **Step 1: Run focused tests**

Run `pnpm test:unit src/lib/rag/chatUi.test.ts src/lib/rag/chatState.test.ts` and fix only feature-related failures.

- [ ] **Step 2: Run project gates**

Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.

- [ ] **Step 3: Review the diff**

Run `git diff --check` and confirm all changed lines trace to the three requested behaviors.
