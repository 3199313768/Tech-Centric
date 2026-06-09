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
