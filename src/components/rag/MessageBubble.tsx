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
          ? 'rounded-br-md bg-gradient-to-br from-[var(--sg-green-light)] via-[var(--sg-green-mid)] to-[var(--sg-green-deep)] text-[var(--sg-cream)] shadow-[rgba(21,66,18,0.2)]'
          : message.variant === 'contact'
            ? 'rounded-bl-md border border-[var(--sg-green-light)]/15 bg-[var(--sg-green-light)]/[0.08] text-zinc-100 shadow-[rgba(21,66,18,0.2)] backdrop-blur-xl'
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
