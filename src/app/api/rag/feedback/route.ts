import { NextResponse } from 'next/server'

import { parseRagFeedbackPayload, upsertRagFeedback } from '@/lib/rag/feedback'
import { isRagFeedbackRateLimited } from '@/lib/rag/rateLimit'

const MAX_BODY_BYTES = 2_048

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'anonymous'
}

export async function POST(req: Request) {
  try {
    const contentLength = Number(req.headers.get('content-length') || '0')
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: '请求内容过大' }, { status: 400 })
    }

    if (await isRagFeedbackRateLimited(getClientIp(req))) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
    }

    const rawBody = await req.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: '请求内容过大' }, { status: 400 })
    }

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: '反馈格式无效' }, { status: 400 })
    }

    const parsed = parseRagFeedbackPayload(body)
    if (!parsed.ok) {
      return NextResponse.json({ error: '反馈格式无效' }, { status: 400 })
    }

    const result = await upsertRagFeedback(parsed.value)
    if (result === 'missing-response') {
      return NextResponse.json({ error: '回答不存在' }, { status: 404 })
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('RAG feedback error:', error)
    return NextResponse.json({ error: '反馈暂时无法保存，请稍后再试' }, { status: 500 })
  }
}
