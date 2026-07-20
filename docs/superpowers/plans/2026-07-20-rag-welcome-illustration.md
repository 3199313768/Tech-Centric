# RAG Welcome Illustration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a SpiritGarden-style illustration to the public RAG assistant's initial welcome card without changing chat behavior.

**Architecture:** Generate one project-owned WebP asset, render it only inside the existing `messages.length === 0` welcome branch, and style it with a dedicated responsive wrapper. A Playwright assertion verifies the illustration appears when the assistant opens and disappears after a question starts the conversation.

**Tech Stack:** OpenAI built-in image generation, Next.js 16 `next/image`, React 19, CSS, Playwright.

---

## File Structure

- Create `public/spirit-garden/rag-guide-welcome.webp`: decorative assistant welcome illustration.
- Modify `src/components/rag/chat/ChatPanel.tsx`: render the image in the existing empty-message welcome card.
- Modify `src/app/globals.css`: size and crop the illustration inside the narrow assistant panel.
- Modify `e2e/core-paths.spec.ts`: verify initial visibility and post-message removal.

### Task 1: Define the visible behavior

**Files:**
- Modify: `e2e/core-paths.spec.ts`

- [ ] **Step 1: Add the failing browser test**

Append this test inside `test.describe('核心访客路径', ...)`:

```ts
  test('RAG 欢迎插画只在初始状态展示', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '打开庭院导引' }).click()

    const illustration = page.getByTestId('rag-welcome-illustration')
    await expect(illustration).toBeVisible()

    await page.getByRole('button', { name: '问项目' }).click()
    await expect(illustration).toHaveCount(0)
  })
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
pnpm test:e2e e2e/core-paths.spec.ts --grep "RAG 欢迎插画"
```

Expected: FAIL because `data-testid="rag-welcome-illustration"` does not exist.

### Task 2: Generate the project-owned illustration

**Files:**
- Create: `public/spirit-garden/rag-guide-welcome.webp`

- [ ] **Step 1: Generate one image with the built-in image tool**

Use this prompt:

```text
Use case: illustration-story
Asset type: compact welcome illustration for a narrow website AI chat panel
Primary request: a friendly miniature garden guide spirit beside an open glowing knowledge book, with delicate leaves and subtle connected knowledge sparks
Scene/backdrop: soft handmade paper garden atmosphere, self-contained card composition
Style/medium: polished storybook watercolor with gentle ink outlines, matching a refined botanical digital garden
Composition/framing: compact horizontal composition, central subject, generous safe margins, readable when displayed around 320 by 150 pixels
Lighting/mood: warm, welcoming, quietly magical
Color palette: natural moss green, warm parchment beige, muted teal-blue glow
Constraints: no text, no letters, no logo, no chat UI, no watermark, no photorealism, no hard rectangular border
```

- [ ] **Step 2: Copy the selected result into the project**

Save the chosen generated output as:

```text
public/spirit-garden/rag-guide-welcome.webp
```

Do not overwrite any existing asset.

- [ ] **Step 3: Validate the image file**

Run:

```bash
file public/spirit-garden/rag-guide-welcome.webp
```

Expected: a valid WebP image with non-zero dimensions.

### Task 3: Render and style the illustration

**Files:**
- Modify: `src/components/rag/chat/ChatPanel.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Render the image in the existing welcome card**

Inside `<div className="sg-rag-welcome">`, before `.sg-rag-welcome__icon`, add:

```tsx
<div className="sg-rag-welcome__illustration" data-testid="rag-welcome-illustration">
  <Image
    src="/spirit-garden/rag-guide-welcome.webp"
    alt=""
    fill
    sizes="(max-width: 640px) calc(100vw - 48px), 336px"
    className="sg-rag-welcome__illustration-img"
    aria-hidden
  />
</div>
```

Keep it inside the existing `messages.length === 0` branch so it disappears automatically after the first message.

- [ ] **Step 2: Add minimal responsive styles**

Add after `.sg-rag-welcome` in `src/app/globals.css`:

```css
.sg-rag-welcome__illustration {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  margin-bottom: 14px;
  overflow: hidden;
  border-radius: 12px;
  background: var(--color-ai-card-icon-bg);
}

.sg-rag-welcome__illustration-img {
  object-fit: cover;
}
```

- [ ] **Step 3: Run the focused browser test**

Run:

```bash
pnpm test:e2e e2e/core-paths.spec.ts --grep "RAG 欢迎插画"
```

Expected: PASS; the illustration is visible initially and removed after selecting “问项目”.

### Task 4: Verify project quality gates

**Files:**
- Verify only

- [ ] **Step 1: Run lint**

Run `pnpm lint`.

Expected: exit code 0.

- [ ] **Step 2: Run type checking**

Run `pnpm typecheck`.

Expected: exit code 0.

- [ ] **Step 3: Run the production build**

Run `pnpm build`.

Expected: exit code 0 and all Next.js routes compile successfully.

- [ ] **Step 4: Inspect the final diff**

Run:

```bash
git diff --check
git diff -- src/components/rag/chat/ChatPanel.tsx src/app/globals.css e2e/core-paths.spec.ts
```

Expected: no whitespace errors; every changed line traces to the welcome illustration.

- [ ] **Step 5: Commit the implementation files**

```bash
git add public/spirit-garden/rag-guide-welcome.webp \
  src/components/rag/chat/ChatPanel.tsx \
  src/app/globals.css \
  e2e/core-paths.spec.ts
git commit -m "feat: add RAG welcome illustration"
```
