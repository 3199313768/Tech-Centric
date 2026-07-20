import { NextResponse } from 'next/server'
import { createEmbedding } from '@/lib/rag/embedding'
import { streamRagAnswer } from '@/lib/rag/deepseek'
import { isRagChatRateLimited } from '@/lib/rag/rateLimit'
import { matchRagChunks, toPublicSources } from '@/lib/rag/retrieval'
import type { RagSource } from '@/lib/rag/types'

const MAX_MESSAGE_LENGTH = 500
const MAX_BODY_BYTES = 4_096

type SseEvent =
  | { type: 'meta'; sources: RagSource[] }
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; error: string }

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

function encodeSse(event: SseEvent) {
  return `data: ${JSON.stringify(event)}\n\n`
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
  try {
    const contentLength = Number(req.headers.get('content-length') || '0')
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: '请求内容过大' }, { status: 413 })
    }

    const body = await req.json() as { message?: unknown }
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!message) {
      return NextResponse.json({ error: '请输入问题' }, { status: 400 })
    }

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

    const embedding = await createEmbedding(message)
    const results = await matchRagChunks(embedding, 8, 0.2)
    const sources = toPublicSources(results).slice(0, 5)

    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: SseEvent) => {
          controller.enqueue(encoder.encode(encodeSse(event)))
        }

        try {
          send({ type: 'meta', sources })

          let hasContent = false
          for await (const text of streamRagAnswer(message, results)) {
            hasContent = true
            send({ type: 'delta', text })
          }

          if (!hasContent) {
            send({ type: 'delta', text: '我暂时没有生成有效回答。' })
          }

          send({ type: 'done' })
        } catch (error) {
          console.error('RAG chat stream error:', error)
          send({ type: 'error', error: 'AI 助手暂时不可用，请稍后再试' })
        } finally {
          controller.close()
        }
      },
    })

    return createSseResponse(stream)
  } catch (error) {
    console.error('RAG chat error:', error)
    return NextResponse.json({ error: 'AI 助手暂时不可用，请稍后再试' }, { status: 500 })
  }
}
