import type {
  RagChatRequest,
  RagPageContext,
  RagSseEvent,
} from '@/lib/rag/types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PAGE_CONTEXTS = new Set<RagPageContext>([
  'projects',
  'skills',
  'knowledge',
  'resources',
  'vibe',
  'about',
  'showcase',
  'search',
  'stats',
])

export type RagChatRequestParseResult =
  | { ok: true; value: RagChatRequest }
  | { ok: false }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseRagChatRequest(value: unknown): RagChatRequestParseResult {
  if (!isRecord(value) || typeof value.message !== 'string') {
    return { ok: false }
  }

  const message = value.message.trim()
  const pageContext = value.pageContext ?? null
  const sessionId = value.sessionId ?? null

  if (
    !message
    || (pageContext !== null
      && (typeof pageContext !== 'string'
        || !PAGE_CONTEXTS.has(pageContext as RagPageContext)))
    || (sessionId !== null
      && (typeof sessionId !== 'string' || !UUID_PATTERN.test(sessionId)))
  ) {
    return { ok: false }
  }

  return {
    ok: true,
    value: {
      message,
      pageContext: pageContext as RagPageContext | null,
      sessionId,
    },
  }
}

export function encodeRagSse(event: RagSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}
