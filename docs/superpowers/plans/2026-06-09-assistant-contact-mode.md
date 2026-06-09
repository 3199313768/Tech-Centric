# Assistant Contact Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local Contact Mode to the floating AI assistant so visitors can contact the owner without leaving the assistant.

**Architecture:** `ChatPanel` keeps Ask Mode for RAG and adds a local Contact Mode state machine. Contact data stays in client state, uses pure helpers from `contactFlow.ts`, and renders inline actions/summary components in the same message stream. Contact flow never calls `/api/rag/chat` or writes to Supabase.

**Tech Stack:** Next.js 16 App Router, React 19 client components, TypeScript, Tailwind CSS, lucide-react.

---

## File Structure

### Create

- `src/components/rag/contactFlow.ts`: Contact constants, intent detection, validation, mailto builder, summary helpers.
- `src/components/rag/ContactActions.tsx`: Reusable button row for message actions.
- `src/components/rag/ContactSummary.tsx`: Compact email draft preview.

### Modify

- `src/lib/rag/types.ts`: Add `MessageAction`, `ChatMessage.actions`, and `ChatMessage.variant`.
- `src/components/rag/MessageBubble.tsx`: Render actions and optional contact summary.
- `src/components/rag/SuggestedQuestions.tsx`: Support ask suggestions and local action suggestions.
- `src/components/rag/ChatPanel.tsx`: Add Contact Mode state machine before RAG API calls.

### Verify

- `npx eslint src/lib/rag/types.ts src/components/rag/contactFlow.ts src/components/rag/ContactActions.tsx src/components/rag/ContactSummary.tsx src/components/rag/MessageBubble.tsx src/components/rag/SuggestedQuestions.tsx src/components/rag/ChatPanel.tsx`

---

## Task 1: Add Contact Types And Helpers

**Files:**
- Modify: `src/lib/rag/types.ts`
- Create: `src/components/rag/contactFlow.ts`

- [ ] **Step 1: Extend message types**

Modify `src/lib/rag/types.ts` by adding these interfaces above `ChatMessage` and replacing `ChatMessage` with the extended shape:

```ts
export interface MessageAction {
  id: string
  label: string
  kind: 'primary' | 'secondary' | 'ghost'
}

export interface ContactSummaryData {
  subject: string
  body: string
  email: string
  phone: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: RagSource[]
  actions?: MessageAction[]
  variant?: 'default' | 'contact' | 'system'
  contactSummary?: ContactSummaryData
}
```

- [ ] **Step 2: Create contact helper file**

Create `src/components/rag/contactFlow.ts`:

```ts
export type AssistantMode = 'ask' | 'contact'
export type ContactStage = 'intent' | 'name' | 'email' | 'message' | 'confirm' | 'done'

export interface ContactData {
  intent: string
  name: string
  email: string
  message: string
}

export const CONTACT_EMAIL = '3199313768@qq.com'
export const CONTACT_PHONE = '17613712197'

export const CONTACT_INTENTS = [
  { id: 'intent:合作咨询', label: '💼 合作咨询', value: '合作咨询' },
  { id: 'intent:技术交流', label: '💬 技术交流', value: '技术交流' },
  { id: 'intent:面试机会', label: '🎯 面试机会', value: '面试机会' },
  { id: 'intent:就是打个招呼', label: '👋 打个招呼', value: '就是打个招呼' },
]

const CONTACT_PATTERNS = ['联系你', '怎么联系', '联系我', '合作', '面试', '电话', '邮箱', '加微信', '发邮件', '沟通']
const DIRECT_INFO_PATTERNS = ['邮箱是什么', '邮箱多少', '电话多少', '手机号', '联系方式', '怎么联系你']

export function createEmptyContactData(): ContactData {
  return {
    intent: '',
    name: '',
    email: '',
    message: '',
  }
}

export function detectContactIntent(message: string) {
  return CONTACT_PATTERNS.some(pattern => message.includes(pattern))
}

export function isDirectContactInfoRequest(message: string) {
  return DIRECT_INFO_PATTERNS.some(pattern => message.includes(pattern))
}

export function validateContactEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function createContactSubject(data: ContactData) {
  return `来自 Tech-Centric 的${data.intent || '联系'} - ${data.name || '访客'}`
}

export function createContactBody(data: ContactData) {
  return [
    `称呼：${data.name}`,
    `邮箱：${data.email}`,
    `意图：${data.intent}`,
    '',
    '留言：',
    data.message,
  ].join('\n')
}

export function buildMailtoUrl(data: ContactData) {
  const subject = encodeURIComponent(createContactSubject(data))
  const body = encodeURIComponent(createContactBody(data))
  const cc = encodeURIComponent(data.email)
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}&cc=${cc}`
}

export function createContactSummary(data: ContactData) {
  return {
    subject: createContactSubject(data),
    body: createContactBody(data),
    email: CONTACT_EMAIL,
    phone: CONTACT_PHONE,
  }
}
```

- [ ] **Step 3: Run scoped lint**

Run:

```bash
npx eslint src/lib/rag/types.ts src/components/rag/contactFlow.ts
```

Expected: exit code `0`.

---

## Task 2: Add Contact Rendering Components

**Files:**
- Create: `src/components/rag/ContactActions.tsx`
- Create: `src/components/rag/ContactSummary.tsx`
- Modify: `src/components/rag/MessageBubble.tsx`

- [ ] **Step 1: Create action renderer**

Create `src/components/rag/ContactActions.tsx`:

```tsx
import type { MessageAction } from '@/lib/rag/types'

interface ContactActionsProps {
  actions: MessageAction[]
  onAction: (actionId: string) => void
}

const actionClassName = {
  primary: 'border-cyan-300/40 bg-cyan-300 text-zinc-950 hover:bg-cyan-200',
  secondary: 'border-white/10 bg-white/[0.08] text-zinc-100 hover:border-cyan-300/35 hover:bg-cyan-300/10',
  ghost: 'border-transparent bg-transparent text-zinc-400 hover:text-cyan-100',
}

export function ContactActions({ actions, onAction }: ContactActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${actionClassName[action.kind]}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create summary renderer**

Create `src/components/rag/ContactSummary.tsx`:

```tsx
import type { ContactSummaryData } from '@/lib/rag/types'

interface ContactSummaryProps {
  summary: ContactSummaryData
}

export function ContactSummary({ summary }: ContactSummaryProps) {
  return (
    <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-zinc-950/50 p-3 text-xs text-zinc-300">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Email Draft</p>
      <div className="mt-2 space-y-2">
        <p><span className="text-zinc-500">To:</span> {summary.email}</p>
        <p><span className="text-zinc-500">Phone:</span> {summary.phone}</p>
        <p><span className="text-zinc-500">Subject:</span> {summary.subject}</p>
        <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl bg-black/20 p-3 font-sans leading-5 text-zinc-300">
          {summary.body}
        </pre>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Render actions and summary in messages**

Modify `src/components/rag/MessageBubble.tsx`:

```tsx
import type { ChatMessage } from '@/lib/rag/types'
import { ContactActions } from './ContactActions'
import { ContactSummary } from './ContactSummary'
import { SourceList } from './SourceList'

interface MessageBubbleProps {
  message: ChatMessage
  onAction?: (actionId: string) => void
}

export function MessageBubble({ message, onAction }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[86%] rounded-[1.35rem] px-4 py-3 text-sm leading-6 shadow-lg ${
        isUser
          ? 'rounded-br-md bg-gradient-to-br from-cyan-200 via-cyan-300 to-sky-400 text-zinc-950 shadow-cyan-500/20'
          : message.variant === 'contact'
            ? 'rounded-bl-md border border-cyan-300/15 bg-cyan-300/[0.08] text-zinc-100 shadow-cyan-950/20 backdrop-blur-xl'
            : 'rounded-bl-md border border-white/10 bg-white/[0.07] text-zinc-100 shadow-black/20 backdrop-blur-xl'
      }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {message.contactSummary ? <ContactSummary summary={message.contactSummary} /> : null}
        {!isUser ? <SourceList sources={message.sources || []} /> : null}
        {!isUser && onAction ? <ContactActions actions={message.actions || []} onAction={onAction} /> : null}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run scoped lint**

Run:

```bash
npx eslint src/components/rag/ContactActions.tsx src/components/rag/ContactSummary.tsx src/components/rag/MessageBubble.tsx
```

Expected: exit code `0`.

---

## Task 3: Upgrade Suggestions For Local Actions

**Files:**
- Modify: `src/components/rag/SuggestedQuestions.tsx`

- [ ] **Step 1: Replace suggestion component**

Replace `src/components/rag/SuggestedQuestions.tsx` with:

```tsx
export interface SuggestedItem {
  id: string
  label: string
  value: string
  type: 'question' | 'action'
}

const DEFAULT_ITEMS: SuggestedItem[] = [
  { id: 'ask-projects', label: '问项目', value: '你做过哪些 AI 相关项目？', type: 'question' },
  { id: 'ask-skills', label: '看技术栈', value: '你的主要技术栈是什么？', type: 'question' },
  { id: 'ask-resources', label: '资源推荐', value: '有什么前端学习资源推荐？', type: 'question' },
  { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
]

interface SuggestedQuestionsProps {
  items?: SuggestedItem[]
  onSelect: (item: SuggestedItem) => void
}

export function SuggestedQuestions({ items = DEFAULT_ITEMS, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-300 shadow-sm shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run scoped lint**

Run:

```bash
npx eslint src/components/rag/SuggestedQuestions.tsx
```

Expected: exit code `0`.

---

## Task 4: Implement Contact Mode In ChatPanel

**Files:**
- Modify: `src/components/rag/ChatPanel.tsx`

- [ ] **Step 1: Add imports**

Update imports in `ChatPanel.tsx`:

```tsx
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, Sparkles } from 'lucide-react'
import type { ChatMessage, RagSource } from '@/lib/rag/types'
import {
  buildMailtoUrl,
  CONTACT_EMAIL,
  CONTACT_INTENTS,
  CONTACT_PHONE,
  ContactData,
  ContactStage,
  createContactSummary,
  createEmptyContactData,
  detectContactIntent,
  isDirectContactInfoRequest,
  validateContactEmail,
} from './contactFlow'
import { MessageBubble } from './MessageBubble'
import { SuggestedItem, SuggestedQuestions } from './SuggestedQuestions'
```

- [ ] **Step 2: Add state**

Inside `ChatPanel`, add state after existing `isLoading` state:

```tsx
const [mode, setMode] = useState<'ask' | 'contact'>('ask')
const [contactStage, setContactStage] = useState<ContactStage>('intent')
const [contactData, setContactData] = useState<ContactData>(() => createEmptyContactData())
const [copiedLabel, setCopiedLabel] = useState('')
```

- [ ] **Step 3: Add message helpers**

Add these helpers before `submitMessage`:

```tsx
function addUserMessage(content: string) {
  setMessages((prev) => [...prev, { role: 'user', content }])
}

function addAssistantMessage(message: Omit<ChatMessage, 'role'>) {
  setMessages((prev) => [...prev, { role: 'assistant', ...message }])
}

function startContactFlow() {
  setMode('contact')
  setContactStage('intent')
  setContactData(createEmptyContactData())
  addAssistantMessage({
    content: '当然可以。你想聊哪一类事情？',
    variant: 'contact',
    actions: CONTACT_INTENTS.map((intent) => ({ id: intent.id, label: intent.label, kind: 'secondary' })),
  })
}

function showContactInfoCard() {
  addAssistantMessage({
    content: `可以这样联系我：\n邮箱：${CONTACT_EMAIL}\n电话：${CONTACT_PHONE}`,
    variant: 'contact',
    actions: [
      { id: 'copy:email', label: '复制邮箱', kind: 'primary' },
      { id: 'copy:phone', label: '复制电话', kind: 'secondary' },
      { id: 'contact:start', label: '写一封邮件', kind: 'secondary' },
    ],
  })
}
```

- [ ] **Step 4: Add contact flow processor**

Add this function before `submitMessage`:

```tsx
function handleContactInput(content: string) {
  if (contactStage === 'name') {
    if (content.length < 2) {
      addAssistantMessage({ content: '名字至少需要 2 个字符哦。', variant: 'contact' })
      return
    }

    setContactData((prev) => ({ ...prev, name: content }))
    setContactStage('email')
    addAssistantMessage({ content: `好的，${content}。方便留个邮箱吗？这样我可以回复你。`, variant: 'contact' })
    return
  }

  if (contactStage === 'email') {
    if (!validateContactEmail(content)) {
      addAssistantMessage({ content: '这个邮箱格式好像不太对，再检查一下？', variant: 'contact' })
      return
    }

    setContactData((prev) => ({ ...prev, email: content }))
    setContactStage('message')
    addAssistantMessage({ content: '收到。你想具体聊什么？可以简单写下背景或需求。', variant: 'contact' })
    return
  }

  if (contactStage === 'message') {
    if (content.length < 2) {
      addAssistantMessage({ content: '说点什么吧，哪怕只是一句问候。', variant: 'contact' })
      return
    }

    if (content.length > 800) {
      addAssistantMessage({ content: '留言先控制在 800 字以内，方便生成邮件草稿。', variant: 'contact' })
      return
    }

    const nextData = { ...contactData, message: content }
    setContactData(nextData)
    setContactStage('confirm')
    addAssistantMessage({
      content: '我整理好了邮件草稿，确认后可以打开邮箱发送。',
      variant: 'contact',
      contactSummary: createContactSummary(nextData),
      actions: [
        { id: 'contact:send', label: '打开邮箱发送', kind: 'primary' },
        { id: 'copy:email', label: '复制邮箱', kind: 'secondary' },
        { id: 'copy:phone', label: '复制电话', kind: 'secondary' },
        { id: 'contact:restart', label: '重新填写', kind: 'ghost' },
        { id: 'contact:ask', label: '返回问答', kind: 'ghost' },
      ],
    })
  }
}
```

- [ ] **Step 5: Add action dispatcher**

Add this function before `handleSubmit`:

```tsx
async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  setCopiedLabel(label)
  setTimeout(() => setCopiedLabel(''), 1800)
}

function handleAction(actionId: string) {
  if (actionId.startsWith('intent:')) {
    const intent = actionId.replace('intent:', '')
    setContactData((prev) => ({ ...prev, intent }))
    setContactStage('name')
    addUserMessage(intent)
    addAssistantMessage({ content: '怎么称呼你？', variant: 'contact' })
    return
  }

  if (actionId === 'contact:start') {
    startContactFlow()
    return
  }

  if (actionId === 'contact:restart') {
    startContactFlow()
    return
  }

  if (actionId === 'contact:ask') {
    setMode('ask')
    setContactStage('intent')
    addAssistantMessage({ content: '已回到问答模式。你可以继续问我项目、经历、技术栈或资源。', variant: 'system' })
    return
  }

  if (actionId === 'contact:send') {
    window.location.href = buildMailtoUrl(contactData)
    setContactStage('done')
    addAssistantMessage({ content: '已为你打开邮箱客户端。如果没有弹出，可以复制邮箱或电话直接联系我。', variant: 'contact' })
    return
  }

  if (actionId === 'copy:email') {
    void copyText(CONTACT_EMAIL, '邮箱已复制')
    return
  }

  if (actionId === 'copy:phone') {
    void copyText(CONTACT_PHONE, '电话已复制')
  }
}
```

- [ ] **Step 6: Update submitMessage routing**

Replace the start of `submitMessage` through the initial user message append with:

```tsx
async function submitMessage(nextMessage?: string) {
  const content = (nextMessage || input).trim()
  if (!content || isLoading) return

  addUserMessage(content)
  setInput('')

  if (mode === 'contact') {
    handleContactInput(content)
    return
  }

  if (isDirectContactInfoRequest(content)) {
    showContactInfoCard()
    return
  }

  if (detectContactIntent(content)) {
    startContactFlow()
    return
  }

  setIsLoading(true)
```

Keep the existing RAG `try/catch/finally` block after `setIsLoading(true)`.

- [ ] **Step 7: Update suggestions usage and message rendering**

Replace the current `SuggestedQuestions` usage with:

```tsx
<SuggestedQuestions onSelect={(item: SuggestedItem) => {
  if (item.type === 'action' && item.value === 'start-contact') {
    startContactFlow()
    return
  }
  void submitMessage(item.value)
}} />
```

Replace message rendering with:

```tsx
{messages.map((message, index) => (
  <MessageBubble key={`${message.role}-${index}`} message={message} onAction={handleAction} />
))}
```

Add copied feedback near the loading indicator:

```tsx
{copiedLabel ? (
  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
    {copiedLabel}
  </div>
) : null}
```

- [ ] **Step 8: Run scoped lint**

Run:

```bash
npx eslint src/components/rag/ChatPanel.tsx src/components/rag/MessageBubble.tsx src/components/rag/SuggestedQuestions.tsx src/components/rag/ContactActions.tsx src/components/rag/ContactSummary.tsx src/components/rag/contactFlow.ts src/lib/rag/types.ts
```

Expected: exit code `0`.

---

## Task 5: Manual Smoke Verification

**Files:**
- No code changes.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: Next.js dev server starts and serves `http://localhost:3000`.

- [ ] **Step 2: Verify Ask Mode still works**

Open `http://localhost:3000`, open the assistant, click `看技术栈`.
Expected:
- A user message appears with “你的主要技术栈是什么？”
- The assistant calls the existing RAG API.
- If API/env/index are configured, an answer appears with sources; if not, a friendly error appears.

- [ ] **Step 3: Verify Contact Mode button path**

Click `联系我`.
Expected:
- The assistant asks “你想聊哪一类事情？”
- Four intent buttons appear.
- No `/api/rag/chat` request is required for this path.

- [ ] **Step 4: Verify Contact Mode form path**

Click `合作咨询`, then enter:

```text
杨倩
```

Then enter:

```text
test@example.com
```

Then enter:

```text
想聊一个 RAG 个人站助手合作。
```

Expected:
- Confirmation message appears.
- Draft preview includes name, email, intent, and message.
- Buttons include `打开邮箱发送`, `复制邮箱`, `复制电话`, `重新填写`, `返回问答`.

- [ ] **Step 5: Verify validation**

Restart contact flow and enter invalid email:

```text
abc
```

Expected: assistant replies “这个邮箱格式好像不太对，再检查一下？” and remains in email stage.

- [ ] **Step 6: Verify direct contact info**

Return to Ask Mode, type:

```text
你的邮箱是什么？
```

Expected:
- Assistant shows email/phone contact card.
- Buttons allow copying email/phone.
- RAG API is not required for this direct contact-info path.

---

## Self-Review Checklist

- Spec coverage: Tasks cover Contact Mode entry, local state flow, direct contact info, validation, mailto, copy actions, return to Ask Mode, and Ask Mode preservation.
- Red-flag scan: No unfinished-marker or copy-forward implementation steps remain.
- Type consistency: `MessageAction`, `ContactSummaryData`, `ContactData`, and `ContactStage` names are consistent across tasks.
