'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { ChatMessage } from '@/lib/rag/types'
import { ContactActions } from '@/components/rag/contact/ContactActions'
import { ContactSummary } from '@/components/rag/contact/ContactSummary'
import { SourceList } from '@/components/rag/chat/SourceList'

interface MessageBubbleProps {
  message: ChatMessage
  onAction?: (actionId: string) => void
}

function getBubbleClassName(message: ChatMessage) {
  if (message.role === 'user') return 'sg-rag-bubble sg-rag-bubble--user'
  if (message.variant === 'contact') return 'sg-rag-bubble sg-rag-bubble--contact'
  return 'sg-rag-bubble sg-rag-bubble--assistant'
}

const bubbleMotion = {
  initial: { opacity: 0, y: 14, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
}

export function MessageBubble({ message, onAction }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const bubble = (
    <motion.div className={getBubbleClassName(message)} {...bubbleMotion}>
      <p className="sg-rag-bubble__text">{message.content}</p>
      {message.contactSummary ? <ContactSummary summary={message.contactSummary} /> : null}
      {!isUser ? <SourceList sources={message.sources || []} /> : null}
      {!isUser && onAction ? <ContactActions actions={message.actions || []} onAction={onAction} /> : null}
    </motion.div>
  )

  if (isUser) {
    return <div className="sg-rag-row sg-rag-row--user">{bubble}</div>
  }

  return (
    <div className="sg-rag-row sg-rag-row--assistant">
      <Image
        src="/spirit-garden/icon-sparkle.png"
        alt=""
        width={28}
        height={28}
        className="sg-rag-bubble__avatar"
        aria-hidden
        unoptimized
      />
      {bubble}
    </div>
  )
}
