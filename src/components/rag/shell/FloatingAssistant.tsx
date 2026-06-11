'use client'

import { useState } from 'react'
import { Bot, Sparkles, X } from 'lucide-react'
import { ChatPanel } from '@/components/rag/chat/ChatPanel'

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-4"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        right: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {isOpen ? (
        <div className="w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-auto">
          <ChatPanel />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group relative flex min-h-11 min-w-11 items-center gap-3 overflow-hidden rounded-full border border-[var(--sg-green-light)]/25 bg-[var(--sg-ink)]/90 px-4 py-3 text-sm font-medium text-[var(--sg-cream)] shadow-[0_18px_60px_rgba(21,66,18,0.28)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--sg-green-light)]/50 hover:shadow-[0_24px_80px_rgba(21,66,18,0.38)]"
        aria-expanded={isOpen}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(161,212,148,0.28),transparent_35%),linear-gradient(135deg,rgba(45,90,39,0.18),rgba(129,193,253,0.12))] opacity-80" />
        {!isOpen ? <span className="absolute -inset-1 rounded-full bg-[var(--sg-green-light)]/20 blur-xl transition-opacity group-hover:opacity-80" /> : null}
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[var(--sg-green-deep)] text-[var(--sg-cream)] shadow-lg shadow-[rgba(21,66,18,0.3)]">
          {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </span>
        <span className="relative hidden flex-col items-start leading-none sm:flex">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] text-[var(--sg-green-light)]/80">
            <Sparkles className="h-3 w-3" /> AI Guide
          </span>
          <span className="mt-1 text-sm text-white">{isOpen ? '收起助手' : '问问站内助手'}</span>
        </span>
      </button>
    </div>
  )
}
