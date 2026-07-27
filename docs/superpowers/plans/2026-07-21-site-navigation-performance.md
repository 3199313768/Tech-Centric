# Site Navigation Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide immediate route-level loading feedback and prevent closed management UI from loading on the first visit to projects, skills, and resources.

**Architecture:** Add one route-group loading boundary using the existing fallback. Extract the project detail modal and skill delete confirmation into focused dynamic modules, then conditionally mount all dynamic management components only when their state is active.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next/dynamic`, Vitest.

---

### Task 1: Route-level loading boundary

**Files:**
- Create: `src/app/(site)/loading.tsx`
- Create: `src/lib/site/lazyUi.test.ts`

- [ ] Write a failing source-policy test that expects the route loading file to render `SitePageFallback`.
- [ ] Run `pnpm test:unit src/lib/site/lazyUi.test.ts` and confirm RED.
- [ ] Add the minimal `loading.tsx` using the existing fallback.
- [ ] Re-run the focused test and confirm GREEN.

### Task 2: Project and skill management modules

**Files:**
- Create: `src/components/home/projects/ProjectModal.tsx`
- Modify: `src/components/home/projects/AllProjects.tsx`
- Create: `src/components/home/skills/SkillDeleteConfirm.tsx`
- Modify: `src/components/home/skills/AiSkills.tsx`
- Modify: `src/lib/site/lazyUi.test.ts`

- [ ] Add failing source-policy tests requiring conditional mounts for `ProjectModal`, `AddAllProjectModal`, `AddSkillModal`, and `SkillDeleteConfirm`.
- [ ] Move the existing project modal implementation without changing behavior, then dynamically import and conditionally mount it.
- [ ] Move skill deletion confirmation into a focused dynamic component and conditionally mount it.
- [ ] Run the focused tests and related ESLint checks.

### Task 3: Resource management dialogs

**Files:**
- Modify: `src/components/home/resources/ResourceLinks.tsx`
- Modify: `src/lib/site/lazyUi.test.ts`

- [ ] Add failing source-policy tests requiring conditional mounts for the form, discovery, and confirmation dialogs.
- [ ] Wrap each existing dynamic dialog in its active-state condition without changing callbacks or state.
- [ ] Run the focused tests and related ESLint checks.

### Task 4: Verification

**Files:**
- Modify only files required by feature-related failures.

- [ ] Run `pnpm test:unit src/lib/site/lazyUi.test.ts`.
- [ ] Run ESLint on every changed source file.
- [ ] Run `pnpm typecheck`, `pnpm build`, and record any unrelated pre-existing blockers precisely.
- [ ] Run `git diff --check` and review the complete changed-file list.
