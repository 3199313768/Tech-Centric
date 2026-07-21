import type { ChatMessage, RagSseEvent } from '@/lib/rag/types'

export type RagLoadingStage = 'understanding' | 'retrieving' | 'generating'

const LONG_ANSWER_LENGTH = 600

export function getNextLoadingStage(stage: RagLoadingStage): RagLoadingStage {
  if (stage === 'understanding') return 'retrieving'
  return 'generating'
}

export function getLoadingStageForEvent(
  currentStage: RagLoadingStage | null,
  eventType: RagSseEvent['type'],
): RagLoadingStage | null {
  if (eventType === 'meta') return 'generating'
  if (eventType === 'delta' || eventType === 'done' || eventType === 'error') return null
  return currentStage
}

export function shouldShowAnswerActions(message: ChatMessage) {
  return message.role === 'assistant'
    && message.isComplete === true
    && !message.error
    && (message.variant === undefined || message.variant === 'default')
}

export function shouldShowInsufficientActions(message: ChatMessage) {
  return shouldShowAnswerActions(message)
    && (message.evidenceMode === 'insufficient' || (message.sources?.length ?? 0) === 0)
}

export function isLongRagAnswer(content: string) {
  return content.length > LONG_ANSWER_LENGTH
}
