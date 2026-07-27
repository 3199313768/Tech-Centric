# Archive Card Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Logged-in users can drag-reorder archive project cards; order persists in `all_projects.sort_order` for all visitors.

**Architecture:** Global integer `sort_order`; `@dnd-kit` on archive list when `canReorder`; category filters merge visible order back into full list via `mergeVisibleOrder`; `reorderAllProjects` server action authenticates and writes indices.

**Tech Stack:** Next.js App Router, Supabase, `@dnd-kit/core` + `sortable` + `utilities`, Vitest, existing Toast / `requireAuthenticatedUser`.

## Status

Implemented. Remaining: manual login/guest drag verification.

---

### Task 1–5: Done

- `mergeVisibleOrder` + tests
- DB `sort_order` migration applied (0..18 for 19 projects)
- `reorderAllProjects` + `assertCompleteProjectOrder`
- DnD UI with `canReorder`; login-only handles; optimistic save
- Unit tests passing for order helpers
