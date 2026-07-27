/**
 * RAG chat 协议层：请求体校验 + SSE 事件编码。
 * 与 DeepSeek 上游 SSE 解耦；前端只认此处产出的 `RagSseEvent` 帧。
 */
import type {
  RagChatRequest,
  RagPageContext,
  RagSseEvent,
} from '@/lib/rag/types'

export type { RagSseEvent } from '@/lib/rag/types'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** 允许的 pageContext 白名单；非法值直接判请求失败。 */
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

/**
 * 校验 `/api/rag/chat` 的 JSON body。
 * - `message` 必填且 trim 后非空
 * - `pageContext` / `sessionId` 可缺省（缺省按 null）；有值则须合法
 */
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

/**
 * 编码一条 SSE 帧：`data: <json>\n\n`。
 * 客户端 `consumeRagChatStream` 按同样格式解析。
 */
export function encodeRagSse(event: RagSseEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}
