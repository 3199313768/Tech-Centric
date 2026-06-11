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

export function MessageBubble({ message, onAction }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`sg-rag-row ${isUser ? 'sg-rag-row--user' : 'sg-rag-row--assistant'}`}>
      <div className={getBubbleClassName(message)}>
        <p className="sg-rag-bubble__text">{message.content}</p>
        {message.contactSummary ? <ContactSummary summary={message.contactSummary} /> : null}
        {!isUser ? <SourceList sources={message.sources || []} /> : null}
        {!isUser && onAction ? <ContactActions actions={message.actions || []} onAction={onAction} /> : null}
      </div>
    </div>
  )
}
