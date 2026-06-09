'use client'

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

interface RagChatResponse {
  answer?: string
  sources?: RagSource[]
  error?: string
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'ask' | 'contact'>('ask')
  const [contactStage, setContactStage] = useState<ContactStage>('intent')
  const [contactData, setContactData] = useState<ContactData>(() => createEmptyContactData())
  const [copiedLabel, setCopiedLabel] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isLoading, copiedLabel])

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

  function handleContactInput(content: string) {
    if (contactStage === 'intent') {
      addAssistantMessage({
        content: '请先选择一个联系意图，我会帮你整理邮件。',
        variant: 'contact',
        actions: CONTACT_INTENTS.map((intent) => ({ id: intent.id, label: intent.label, kind: 'secondary' })),
      })
      return
    }

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

    try {
      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
      const result = await response.json() as RagChatResponse

      if (!response.ok || result.error) {
        throw new Error(result.error || 'AI 助手暂时不可用')
      }

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: result.answer || '我暂时没有生成有效回答。',
        sources: result.sources || [],
      }])
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'AI 助手暂时不可用，请稍后再试。',
        sources: [],
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitMessage()
  }

  return (
    <div className="relative flex h-[min(660px,calc(100vh-6.5rem))] w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/85 shadow-[0_30px_120px_rgba(0,0,0,0.55),0_0_80px_rgba(6,182,212,0.18)] backdrop-blur-2xl md:w-[440px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_90%_12%,rgba(168,85,247,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />

      <div className="relative border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-400/20">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-50">
              Tech-Centric AI 助手
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">Online</span>
              {mode === 'contact' ? <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-medium text-cyan-100">Contact</span> : null}
            </p>
            <p className="mt-1 text-xs text-zinc-400">基于站内资料检索，也可以直接联系我。</p>
          </div>
        </div>
      </div>

      <div className="relative flex-1 space-y-4 overflow-y-auto px-4 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.35)_transparent]">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-white/[0.06] p-4 text-sm leading-6 text-cyan-50 shadow-inner shadow-white/5">
              <div className="absolute right-3 top-3 rounded-full bg-cyan-300/10 p-2 text-cyan-200">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="pr-10 font-medium text-white">你好，我是这个网站的 AI 导览。</p>
              <p className="mt-2 text-zinc-300">可以问我站长的项目、技术栈、经历，也可以直接联系我。</p>
            </div>
            <SuggestedQuestions onSelect={(item: SuggestedItem) => {
              if (item.type === 'action' && item.value === 'start-contact') {
                startContactFlow()
                return
              }
              void submitMessage(item.value)
            }} />
          </div>
        ) : null}

        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} message={message} onAction={handleAction} />
        ))}

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
            正在检索站内资料...
          </div>
        ) : null}

        {copiedLabel ? (
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
            {copiedLabel}
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative border-t border-white/10 bg-zinc-950/40 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 shadow-inner shadow-white/5 transition-colors focus-within:border-cyan-300/50 focus-within:bg-white/[0.08]">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={mode === 'contact' && contactStage === 'message' ? 800 : 500}
            placeholder={mode === 'contact' ? '继续填写联系信息...' : '问问这个网站和站长...'}
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-cyan-300 p-2.5 text-zinc-950 shadow-lg shadow-cyan-400/20 transition-all hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
            aria-label="发送"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
