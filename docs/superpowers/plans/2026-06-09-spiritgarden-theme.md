# Animated Bathhouse Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing Next.js personal site to match a warm Japanese fantasy animation bathhouse atmosphere while preserving current content and interactions.

**Architecture:** Apply the migration through global CSS design tokens first, then adjust high-visibility shared components that use inline styles. Keep data, routing, and component structure unchanged to reduce regression risk.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, inline React style objects, CSS custom properties.

---

### Task 1: Theme Tokens And Global Surface

**Files:**
- Modify: `src/app/globals.css`

- [ ] Replace cyan/neon design tokens with warm parchment, bathhouse red, mist blue, lantern gold, and ink neutrals.
- [ ] Update body background to paper texture plus watercolor radial washes.
- [ ] Update scrollbars, selection, magazine dividers, headlines, cards, and helper classes to use the new variables.
- [ ] Preserve existing CSS class names so component behavior remains intact.

### Task 2: Navigation Skin

**Files:**
- Modify: `src/components/Navigation.tsx`

- [ ] Convert nav bar to warm translucent paper surface with stronger blur and soft lantern shadow.
- [ ] Convert tab buttons and knowledge link to pill-like bathhouse sign chips.
- [ ] Preserve active-tab logic, routes, and theme toggle placement.

### Task 3: Main Shell Atmosphere

**Files:**
- Modify: `src/app/page.tsx`

- [ ] Add reusable watercolor mist background layers around tab content.
- [ ] Ensure non-home pages receive the same atmospheric backdrop.
- [ ] Keep section order, tab switching, and scroll tracking unchanged.

### Task 4: Verification

**Files:**
- Inspect: `package.json`

- [ ] Run `npm run lint` to catch TypeScript/JSX style errors.
- [ ] If feasible, run `npm run build` to validate Next.js compilation.
- [ ] Report any pre-existing unrelated warnings or failures separately.
