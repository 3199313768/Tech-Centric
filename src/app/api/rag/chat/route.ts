import { randomUUID } from 'node:crypto'

import { after, NextResponse } from 'next/server'
import { assignContextIds, finalizeCitations } from '@/lib/rag/citations'
import { createEmbedding } from '@/lib/rag/embedding'
import { streamRagAnswer } from '@/lib/rag/deepseek'
import { saveRagResponseSnapshot } from '@/lib/rag/feedback'
import { fuseRagCandidates } from '@/lib/rag/fusion'
import { encodeRagSse, parseRagChatRequest } from '@/lib/rag/protocol'
import { isRagChatRateLimited } from '@/lib/rag/rateLimit'
import { retrieveRagCandidates } from '@/lib/rag/retrieval'
import type { RagSseEvent } from '@/lib/rag/types'

const MAX_MESSAGE_LENGTH = 500
const MAX_BODY_BYTES = 4_096

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'anonymous'
}

function isUnsafePrompt(message: string) {
  const lowered = message.toLowerCase()
  return [
    'system prompt',
    'api key',
    'supabase_service_role_key',
    'deepseek_api_key',
    'openai_api_key',
    '数据库密码',
    '系统提示词',
    '密钥',
  ].some(pattern => lowered.includes(pattern))
}

function createSseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

export async function POST(req: Request) {
  const requestStartedAt = performance.now()

  try {
    const contentLength = Number(req.headers.get('content-length') || '0')
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: '请求内容过大' }, { status: 413 })
    }

    const body: unknown = await req.json()
    const parsedRequest = parseRagChatRequest(body)
    if (!parsedRequest.ok) {
      return NextResponse.json({ error: '请输入问题' }, { status: 400 })
    }
    const { message, pageContext, sessionId: requestedSessionId } = parsedRequest.value

    if (await isRagChatRateLimited(getClientIp(req))) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `问题不能超过 ${MAX_MESSAGE_LENGTH} 个字符` }, { status: 400 })
    }

    if (isUnsafePrompt(message)) {
      return NextResponse.json({
        answer: '这个问题涉及系统提示词、密钥或内部实现细节，我不能提供。你可以问我关于站长经历、项目、技能栈或公开知识库内容的问题。',
        sources: [],
      })
    }

    const responseId = randomUUID()
    const sessionId = requestedSessionId ?? randomUUID()
    const retrievalStartedAt = performance.now()
    const embedding = await createEmbedding(message)
    const retrieval = await retrieveRagCandidates(message, embedding)
    const { candidates, evidenceMode } = fuseRagCandidates({
      ...retrieval,
      pageContext,
    })
    const contexts = assignContextIds(candidates)
    const retrievalMs = Math.round(performance.now() - retrievalStartedAt)

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: RagSseEvent) => {
          controller.enqueue(encoder.encode(encodeRagSse(event)))
        }

        try {
          send({ type: 'meta', responseId, sessionId })

          let rawAnswer = ''
          let firstTokenMs: number | null = null
          for await (const text of streamRagAnswer(message, contexts, evidenceMode)) {
            if (!text) continue
            firstTokenMs ??= Math.round(performance.now() - requestStartedAt)
            rawAnswer += text
            send({ type: 'delta', text })
          }

          if (!rawAnswer) {
            rawAnswer = '我暂时没有生成有效回答。'
            firstTokenMs = Math.round(performance.now() - requestStartedAt)
            send({ type: 'delta', text: rawAnswer })
          }

          const finalized = finalizeCitations(rawAnswer, contexts)
          const totalMs = Math.round(performance.now() - requestStartedAt)
          const timings = {
            retrievalMs,
            firstTokenMs: firstTokenMs ?? totalMs,
            totalMs,
          }

          send({
            type: 'done',
            answer: finalized.answer,
            sources: finalized.sources,
            evidenceMode,
            ...timings,
          })

          after(async () => {
            try {
              await saveRagResponseSnapshot({
                responseId,
                sessionId,
                question: message,
                answer: finalized.answer,
                citedSourceIds: finalized.sources.map(source => source.sourceId),
                timings,
              })
            } catch {
              console.warn('RAG response snapshot persistence failed')
            }
          })

          console.info('RAG chat completed', {
            responseId,
            sessionId,
            evidenceMode,
            sourceCount: finalized.sources.length,
            ...timings,
          })
        } catch (error) {
          console.error('RAG chat stream failed', {
            responseId,
            errorName: error instanceof Error ? error.name : 'UnknownError',
          })
          try {
            send({ type: 'error', error: 'AI 助手暂时不可用，请稍后再试' })
          } catch {
            // The client may have already disconnected.
          }
        } finally {
          try {
            controller.close()
          } catch {
            // The stream may already be closed after a client disconnect.
          }
        }
      },
    })

    return createSseResponse(stream)
  } catch (error) {
    console.error('RAG chat request failed', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })
    return NextResponse.json({ error: 'AI 助手暂时不可用，请稍后再试' }, { status: 500 })
  }
}
