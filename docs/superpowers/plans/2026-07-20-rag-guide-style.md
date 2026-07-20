# RAG Guide Style Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 SpiritGarden token 统一庭院导引入口 / 面板 / 欢迎区 / 气泡 / chip / 输入条的材质与圆角，消除元素打架。

**Architecture:** 仅改 `src/app/globals.css` 中 `.sg-rag-*` 样式；保留 DOM、插画与交互。将 `--color-*` / cyan 焦点替换为 `--sg-*` 与 garden 边框/阴影阶梯。

**Tech Stack:** CSS（SpiritGarden tokens）、Next.js 现有 RAG UI。

**Spec:** `docs/superpowers/specs/2026-07-20-rag-guide-style-design.md`

---

## File Structure

| 文件 | 职责 |
|------|------|
| Modify `src/app/globals.css` | `.sg-rag-*` token / 圆角 / 阴影统一 |

不改 TSX 结构；`SuggestedQuestions` 继续用 `sg-filter-chip sg-rag-chip`，在 `.sg-rag-chip` 上覆盖 cyan。

---

### Task 1: 入口 + 面板 + 页头 token

**Files:**
- Modify: `src/app/globals.css`（约 `.sg-rag-trigger` ～ `.sg-rag-panel__body`）

- [ ] **Step 1: 替换入口与面板样式**

将下列规则改为（保留未列出的相邻规则如 animation / sprite 尺寸）：

```css
.sg-rag-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 8px 16px 8px 8px;
  border-radius: 9999px;
  border: 1px solid rgba(238, 224, 210, 0.55);
  background: var(--sg-paper);
  color: var(--sg-ink);
  box-shadow: 0 16px 40px -20px rgba(74, 66, 56, 0.22);
  cursor: pointer;
  transition:
    transform var(--sg-motion-fast),
    box-shadow var(--sg-motion-fast),
    border-color var(--sg-motion-fast);
  font-size: 14px;
  font-weight: 500;
}

.sg-rag-trigger:hover {
  transform: translateY(-2px);
  border-color: rgba(188, 240, 174, 0.65);
  box-shadow: 0 18px 44px -18px rgba(74, 66, 56, 0.28);
}

.sg-rag-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: min(660px, calc(100vh - 6.5rem));
  max-width: 440px;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(238, 224, 210, 0.45);
  background: var(--sg-paper);
  box-shadow: 0 24px 64px -24px rgba(74, 66, 56, 0.22);
  color: var(--sg-ink);
}

.dark .sg-rag-panel {
  background: rgba(26, 36, 24, 0.96);
  border-color: rgba(161, 212, 148, 0.14);
}

.sg-rag-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(238, 224, 210, 0.4);
}

.dark .sg-rag-panel__header {
  border-bottom-color: rgba(161, 212, 148, 0.14);
}

.sg-rag-panel__avatar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: rgba(188, 240, 174, 0.28);
  border: 1px solid rgba(188, 240, 174, 0.45);
  color: var(--sg-green-deep);
}

.sg-rag-panel__title {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sg-ink);
}

.sg-rag-panel__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(114, 121, 110, 0.78);
}

.dark .sg-rag-panel__subtitle {
  color: rgba(232, 245, 228, 0.68);
}

.sg-rag-badge {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 500;
  border: 1px solid rgba(188, 240, 174, 0.55);
  background: rgba(255, 241, 227, 0.72);
  color: var(--sg-green-deep);
}

.dark .sg-rag-badge {
  border-color: rgba(161, 212, 148, 0.28);
  background: rgba(26, 36, 24, 0.72);
  color: var(--sg-green-light);
}

.sg-rag-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(188, 240, 174, 0.55) transparent;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
style(rag): 统一导引入口与面板 garden token

EOF
)"
```

---

### Task 2: 欢迎区 + chip

**Files:**
- Modify: `src/app/globals.css`（`.sg-rag-welcome*`、`.sg-rag-chip*`）

- [ ] **Step 1: 欢迎区与 chip 覆盖**

```css
.sg-rag-welcome {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(238, 224, 210, 0.35);
  background: rgba(255, 241, 227, 0.55);
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(114, 121, 110, 0.92);
}

.dark .sg-rag-welcome {
  border-color: rgba(161, 212, 148, 0.14);
  background: rgba(26, 36, 24, 0.55);
  color: rgba(232, 245, 228, 0.78);
}

.sg-rag-welcome__illustration {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  margin-bottom: 14px;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(188, 240, 174, 0.22);
}

.sg-rag-welcome__icon {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px;
  border-radius: 50%;
  background: rgba(188, 240, 174, 0.35);
  color: var(--sg-green-deep);
}

.sg-rag-welcome__title {
  margin: 0;
  padding-right: 40px;
  font-weight: 600;
  color: var(--sg-ink);
}

.dark .sg-rag-welcome__title {
  color: rgba(232, 245, 228, 0.92);
}

.sg-rag-chip.sg-filter-chip {
  padding: 6px 14px;
  font-size: 12px;
  min-height: auto;
  border-radius: 9999px;
  border: 1px solid rgba(238, 224, 210, 0.55);
  background: rgba(255, 248, 243, 0.72);
  color: var(--sg-ink);
  box-shadow: none;
}

.sg-rag-chip.sg-filter-chip:hover {
  border-color: rgba(188, 240, 174, 0.7);
  background: rgba(188, 240, 174, 0.22);
  color: var(--sg-green-deep);
}

.dark .sg-rag-chip.sg-filter-chip {
  border-color: rgba(161, 212, 148, 0.22);
  background: rgba(26, 36, 24, 0.55);
  color: rgba(232, 245, 228, 0.86);
}

.dark .sg-rag-chip.sg-filter-chip:hover {
  border-color: rgba(161, 212, 148, 0.4);
  background: rgba(161, 212, 148, 0.14);
  color: var(--sg-green-light);
}
```

删除或覆盖旧的单独 `.sg-rag-chip { padding... }` 块，避免与上面冲突（保留一份即可）。

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
style(rag): 欢迎区与快捷 chip 对齐 garden

EOF
)"
```

---

### Task 3: 气泡 + 输入条 + loading/toast/source

**Files:**
- Modify: `src/app/globals.css`（bubble / input / loading / toast / source / 底部重复阴影规则）

- [ ] **Step 1: 对话区样式**

```css
.sg-rag-bubble {
  max-width: 86%;
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
}

.sg-rag-bubble--user {
  border-bottom-right-radius: 8px;
  background: var(--sg-green-deep);
  color: var(--sg-cream);
  box-shadow: 0 12px 28px -18px rgba(21, 66, 18, 0.35);
}

.sg-rag-bubble--assistant {
  border-bottom-left-radius: 8px;
  border: 1px solid rgba(238, 224, 210, 0.4);
  background: rgba(255, 241, 227, 0.72);
  color: var(--sg-ink);
  box-shadow: 0 12px 28px -18px rgba(74, 66, 56, 0.18);
}

.sg-rag-bubble--contact {
  border-bottom-left-radius: 8px;
  border: 1px solid rgba(188, 240, 174, 0.45);
  background: rgba(188, 240, 174, 0.18);
  color: var(--sg-ink);
}

.dark .sg-rag-bubble--assistant,
.dark .sg-rag-bubble--contact {
  border-color: rgba(161, 212, 148, 0.16);
  background: rgba(26, 36, 24, 0.72);
  color: rgba(232, 245, 228, 0.92);
}

.sg-rag-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid rgba(238, 224, 210, 0.4);
  background: rgba(255, 241, 227, 0.55);
  font-size: 14px;
  color: rgba(114, 121, 110, 0.78);
}

.sg-rag-toast {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  border: 1px solid rgba(188, 240, 174, 0.55);
  background: rgba(255, 241, 227, 0.72);
  color: var(--sg-green-deep);
}

.sg-rag-panel__footer {
  padding: 16px;
  border-top: 1px solid rgba(238, 224, 210, 0.4);
}

.dark .sg-rag-panel__footer {
  border-top-color: rgba(161, 212, 148, 0.14);
}

.sg-rag-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px 6px 14px;
  border-radius: 16px;
  border: 1px solid rgba(238, 224, 210, 0.5);
  background: rgba(255, 248, 243, 0.82);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dark .sg-rag-input-row {
  background: rgba(16, 24, 16, 0.55);
  border-color: rgba(161, 212, 148, 0.18);
}

.sg-rag-input-row:focus-within {
  border-color: rgba(188, 240, 174, 0.75);
  box-shadow: 0 0 0 3px rgba(188, 240, 174, 0.28);
}

.sg-rag-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--sg-ink);
  outline: none;
}

.sg-rag-input::placeholder {
  color: rgba(114, 121, 110, 0.55);
}

.dark .sg-rag-input {
  color: rgba(232, 245, 228, 0.92);
}

.dark .sg-rag-input::placeholder {
  color: rgba(232, 245, 228, 0.45);
}

.sg-rag-send {
  display: grid;
  place-items: center;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background: var(--sg-green-deep);
  color: var(--sg-cream);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  box-shadow: 0 8px 18px -10px rgba(21, 66, 18, 0.4);
}

.sg-rag-source-list {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(238, 224, 210, 0.4);
}
```

将文件后部重复的：

```css
.sg-rag-bubble--contact,
.sg-rag-bubble--assistant {
  box-shadow: 0 10px 24px -14px var(--color-card-shadow-hover);
}
```

改为：

```css
.sg-rag-bubble--contact,
.sg-rag-bubble--assistant {
  box-shadow: 0 12px 28px -18px rgba(74, 66, 56, 0.18);
}
```

并检查 `.sg-rag-source-item` / `.sg-rag-summary` 中残留的 `--color-*`，能改则改为 garden 边框与 parchment 底（同族即可，不必一次完美重写摘要卡布局）。

- [ ] **Step 2: 静态检查残留**

```bash
rg -n "sg-rag.*(color-cyan|color-card|color-ai|color-text)" src/app/globals.css || true
rg -n "--color-(cyan|card|ai)" src/app/globals.css | rg "sg-rag" || true
```

更稳妥：

```bash
rg -n "--color-(cyan|card-border|card-bg|card-shadow|ai-|text-primary|text-muted|text-secondary)" src/app/globals.css -A0 -B5 | rg -n "sg-rag|^--"
```

Expected：`.sg-rag-*` 主路径不再出现 cyan；若 source/summary 仍有少量 `--color-*`，在同 commit 内改为 garden 等价。

- [ ] **Step 3: 目视验收（不强制 e2e）**

浏览器打开首页 → 点「打开庭院导引」：

1. 面板/欢迎/chip/气泡/输入条材质同族  
2. 点「问项目」进入对话后气泡与 chip 不打架  
3. 切换深色主题，焦点环为绿而非 cyan  
4. 欢迎插画仍在初始状态可见  

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "$(cat <<'EOF'
style(rag): 气泡与输入条去掉通用 AI 色

EOF
)"
```

---

## Spec Coverage

| Spec | Task |
|------|------|
| 入口 garden 边框/阴影 | Task 1 |
| 面板/页头/badge | Task 1 |
| 欢迎区减弱嵌套对比 | Task 2 |
| chip 去 cyan | Task 2 |
| 气泡/输入焦点绿 | Task 3 |
| 资产与交互不变 | 全程不改 TSX |
| 深色可读 | Task 1–3 dark 规则 |

## Non-goals

- 换插画、改 ChatPanel DOM、改 RAG API  
- 重写 `sg-filter-chip` 全局（只覆盖 `.sg-rag-chip`）
