'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X } from 'lucide-react'
import { ChatPanel } from '@/components/rag/chat/ChatPanel'

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`sg-rag-shell${isOpen ? ' sg-rag-shell--open' : ''}`}>
      {isOpen ? (
        <div className="sg-rag-panel-wrap">
          <ChatPanel />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="sg-rag-trigger sg-rag-trigger--icon-only sg-rag-trigger--sprite"
        aria-expanded={isOpen}
        aria-label={isOpen ? '关闭庭院导引' : '打开庭院导引'}
      >
        <span className="sg-rag-trigger__icon">
          {isOpen ? (
            <X className="sg-rag-trigger__icon-svg" aria-hidden />
          ) : (
            <Image
              src="/spirit-garden/icon-sparkle.png"
              alt=""
              width={24}
              height={24}
              className="sg-rag-trigger__sprite-img"
              aria-hidden
              unoptimized
            />
          )}
        </span>
      </button>
    </div>
  )
}
