import type { ChatMessage, RagSseEvent } from '@/lib/rag/types'

export function applyRagSseEvent(
  messages: ChatMessage[],
  event: RagSseEvent,
): ChatMessage[] {
  const last = messages.at(-1)
  if (!last || last.role !== 'assistant') return messages

  const next = [...messages]
  if (event.type === 'meta') {
    next[next.length - 1] = {
      ...last,
      responseId: event.responseId,
      sessionId: event.sessionId,
    }
  } else if (event.type === 'delta') {
    next[next.length - 1] = { ...last, content: last.content + event.text }
  } else if (event.type === 'done') {
    next[next.length - 1] = {
      ...last,
      content: event.answer,
      sources: event.sources,
      evidenceMode: event.evidenceMode,
      isComplete: true,
      error: undefined,
    }
  } else {
    next[next.length - 1] = {
      ...last,
      error: event.error,
      isComplete: false,
    }
  }

  return next
}
