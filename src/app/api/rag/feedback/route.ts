import { NextResponse } from 'next/server'

import { parseRagFeedbackPayload, upsertRagFeedback } from '@/lib/rag/feedback'
import { isRagFeedbackRateLimited } from '@/lib/rag/rateLimit'

const MAX_BODY_BYTES = 2_048

type LimitedBodyResult =
  | { ok: true; body: string }
  | { ok: false; tooLarge: true }

export async function readLimitedRequestBody(
  req: Request,
  maxBytes: number,
): Promise<LimitedBodyResult> {
  const contentLengthHeader = req.headers.get('content-length')
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader)
    if (Number.isFinite(contentLength) && contentLength >= 0 && contentLength > maxBytes) {
      return { ok: false, tooLarge: true }
    }
  }

  if (!req.body) return { ok: true, body: '' }

  const reader = req.body.getReader()
  const decoder = new TextDecoder()
  let body = ''
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      return { ok: false, tooLarge: true }
    }
    body += decoder.decode(value, { stream: true })
  }

  body += decoder.decode()
  return { ok: true, body }
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'anonymous'
}

export async function POST(req: Request) {
  try {
    if (await isRagFeedbackRateLimited(getClientIp(req))) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
    }

    const bodyResult = await readLimitedRequestBody(req, MAX_BODY_BYTES)
    if (!bodyResult.ok) {
      return NextResponse.json({ error: '请求内容过大' }, { status: 413 })
    }

    let body: unknown
    try {
      body = JSON.parse(bodyResult.body)
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
