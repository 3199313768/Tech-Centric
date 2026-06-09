'use client'

import { useState } from 'react'
import { Bot, Sparkles, X } from 'lucide-react'
import { ChatPanel } from './ChatPanel'

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-auto">
          <ChatPanel />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group relative flex items-center gap-3 overflow-hidden rounded-full border border-cyan-300/25 bg-zinc-950/90 px-4 py-3 text-sm font-medium text-cyan-50 shadow-[0_18px_60px_rgba(6,182,212,0.28)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200/50 hover:shadow-[0_24px_80px_rgba(6,182,212,0.38)]"
        aria-expanded={isOpen}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.28),transparent_35%),linear-gradient(135deg,rgba(14,165,233,0.18),rgba(168,85,247,0.18))] opacity-80" />
        {!isOpen ? <span className="absolute -inset-1 rounded-full bg-cyan-400/20 blur-xl transition-opacity group-hover:opacity-80" /> : null}
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-cyan-300 text-zinc-950 shadow-lg shadow-cyan-400/30">
          {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </span>
        <span className="relative hidden flex-col items-start leading-none sm:flex">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">
            <Sparkles className="h-3 w-3" /> AI Guide
          </span>
          <span className="mt-1 text-sm text-white">{isOpen ? '收起助手' : '问问站内助手'}</span>
        </span>
      </button>
    </div>
  )
}
