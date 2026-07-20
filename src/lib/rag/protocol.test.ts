import { describe, expect, it } from 'vitest'

import { encodeRagSse, parseRagChatRequest } from '@/lib/rag/protocol'

const responseId = '11111111-1111-4111-8111-111111111111'
const sessionId = '22222222-2222-4222-8222-222222222222'

describe('encodeRagSse', () => {
  it('encodes metadata without speculative sources', () => {
    expect(encodeRagSse({ type: 'meta', responseId, sessionId })).toBe(
      `data: ${JSON.stringify({ type: 'meta', responseId, sessionId })}\n\n`,
    )
  })

  it.each([
    { type: 'delta' as const, text: 'partial answer' },
    { type: 'error' as const, error: 'safe public message' },
  ])('encodes $type events', (event) => {
    expect(encodeRagSse(event)).toBe(`data: ${JSON.stringify(event)}\n\n`)
  })

  it('encodes the authoritative completed answer and quality metrics', () => {
    const event = {
      type: 'done' as const,
      answer: 'Answer [1]',
      sources: [{
        citation: 1,
        sourceId: 'project:one',
        title: 'Project One',
        url: '/projects/one',
        sourceType: 'static_project' as const,
        excerpt: 'Evidence',
      }],
      evidenceMode: 'site' as const,
      retrievalMs: 12,
      firstTokenMs: 34,
      totalMs: 56,
    }

    expect(encodeRagSse(event)).toBe(`data: ${JSON.stringify(event)}\n\n`)
  })
})

describe('parseRagChatRequest', () => {
  it('accepts a trimmed message, supported page context, and UUID session', () => {
    expect(parseRagChatRequest({
      message: '  What did you build?  ',
      pageContext: 'projects',
      sessionId,
    })).toEqual({
      ok: true,
      value: {
        message: 'What did you build?',
        pageContext: 'projects',
        sessionId,
      },
    })
  })

  it('accepts omitted optional context and session', () => {
    expect(parseRagChatRequest({ message: 'hello' })).toEqual({
      ok: true,
      value: { message: 'hello', pageContext: null, sessionId: null },
    })
  })

  it.each([
    null,
    {},
    { message: '   ' },
    { message: 'hello', pageContext: 'home' },
    { message: 'hello', sessionId: 'not-a-uuid' },
  ])('rejects invalid payload %#', (payload) => {
    expect(parseRagChatRequest(payload)).toEqual({ ok: false })
  })
})
