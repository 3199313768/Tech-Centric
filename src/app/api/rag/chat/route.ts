import { NextResponse } from 'next/server'
import { createEmbedding } from '@/lib/rag/embedding'
import { generateRagAnswer } from '@/lib/rag/deepseek'
import { isRagChatRateLimited } from '@/lib/rag/rateLimit'
import { matchRagChunks, toPublicSources } from '@/lib/rag/retrieval'

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
    const answer = await generateRagAnswer(message, results)
    const sources = toPublicSources(results).slice(0, 5)

    return NextResponse.json({ answer, sources })
  } catch (error) {
    console.error('RAG chat error:', error)
    return NextResponse.json({ error: 'AI 助手暂时不可用，请稍后再试' }, { status: 500 })
  }
}
