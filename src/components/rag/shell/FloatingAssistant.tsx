'use client'

import { useState } from 'react'
import { Bot, X } from 'lucide-react'
import { ChatPanel } from '@/components/rag/chat/ChatPanel'

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sg-rag-shell">
      {isOpen ? (
        <div className="sg-rag-panel-wrap">
          <ChatPanel />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="sg-rag-trigger sg-rag-trigger--icon-only"
        aria-expanded={isOpen}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
      >
        <span className="sg-rag-trigger__icon">
          {isOpen ? <X className="sg-rag-trigger__icon-svg" /> : <Bot className="sg-rag-trigger__icon-svg" />}
        </span>
      </button>
    </div>
  )
}
