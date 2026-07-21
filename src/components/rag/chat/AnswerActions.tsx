'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, ChevronDown, ChevronUp, Copy, FolderKanban, Library, Mail } from 'lucide-react'
import type { ChatMessage } from '@/lib/rag/types'
import {
  isLongRagAnswer,
  shouldShowAnswerActions,
  shouldShowInsufficientActions,
} from '@/lib/rag/chatUi'

interface AnswerActionsProps {
  message: ChatMessage
  onAction?: (actionId: string) => void
  onCopy?: (content: string) => void
}

export function AnswerActions({ message, onAction, onCopy }: AnswerActionsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)
  const showActions = shouldShowAnswerActions(message)
  const showInsufficientActions = shouldShowInsufficientActions(message)
  const isLongAnswer = isLongRagAnswer(message.content)

  return (
    <div ref={answerRef} className="sg-rag-answer">
      <p className={`sg-rag-bubble__text${isCollapsed ? ' sg-rag-bubble__text--collapsed' : ''}`}>
        {message.content}
      </p>

      {showActions ? (
        <div className="sg-rag-answer-tools" aria-label="回答操作">
          {onCopy ? (
            <button type="button" className="sg-rag-answer-tool" onClick={() => onCopy(message.content)}>
              <Copy aria-hidden />
              复制回答
            </button>
          ) : null}
          {isLongAnswer ? (
            <>
              <button
                type="button"
                className="sg-rag-answer-tool"
                aria-expanded={!isCollapsed}
                onClick={() => setIsCollapsed(value => !value)}
              >
                {isCollapsed ? <ChevronDown aria-hidden /> : <ChevronUp aria-hidden />}
                {isCollapsed ? '展开回答' : '折叠回答'}
              </button>
              <button
                type="button"
                className="sg-rag-answer-tool"
                onClick={() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <ArrowUp aria-hidden />
                回到顶部
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {showInsufficientActions ? (
        <div className="sg-rag-answer-exits">
          <p className="sg-rag-answer-exits__label">没有找到合适资料？你还可以：</p>
          <div className="sg-rag-answer-exits__actions">
            <Link href="/projects" className="sg-rag-answer-exit">
              <FolderKanban aria-hidden />
              查看项目
            </Link>
            <Link href="/knowledge" className="sg-rag-answer-exit">
              <Library aria-hidden />
              浏览知识库
            </Link>
            {onAction ? (
              <button type="button" className="sg-rag-answer-exit" onClick={() => onAction('contact:start')}>
                <Mail aria-hidden />
                联系园主
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
