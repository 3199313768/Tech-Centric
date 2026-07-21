import { describe, expect, it } from 'vitest'

import { applyRagSseEvent } from '@/lib/rag/chatState'
import type { ChatMessage, RagSseEvent } from '@/lib/rag/types'

const responseId = '11111111-1111-4111-8111-111111111111'
const sessionId = '22222222-2222-4222-8222-222222222222'

function apply(event: RagSseEvent, message: ChatMessage = {
  role: 'assistant',
  content: '',
  sources: [],
  isComplete: false,
}) {
  return applyRagSseEvent([{ role: 'user', content: 'question' }, message], event)
}

describe('applyRagSseEvent', () => {
  it('stores response and session identity from metadata', () => {
    const messages = apply({ type: 'meta', responseId, sessionId })

    expect(messages.at(-1)).toMatchObject({ responseId, sessionId })
  })

  it('appends streamed deltas to the assistant draft', () => {
    const messages = apply(
      { type: 'delta', text: ' world' },
      { role: 'assistant', content: 'hello', isComplete: false },
    )

    expect(messages.at(-1)?.content).toBe('hello world')
  })

  it('replaces the draft with the authoritative done payload', () => {
    const source = {
      citation: 1,
      sourceId: 'static_project:project-1',
      title: 'Project',
      url: '/projects/one',
      sourceType: 'static_project' as const,
      excerpt: 'Evidence',
    }
    const messages = apply({
      type: 'done',
      answer: 'final [1]',
      sources: [source],
      evidenceMode: 'site',
      retrievalMs: 10,
      firstTokenMs: 20,
      totalMs: 30,
    }, {
      role: 'assistant',
      content: 'draft [S1]',
      sources: [],
      responseId,
      sessionId,
      isComplete: false,
    })

    expect(messages.at(-1)).toMatchObject({
      content: 'final [1]',
      sources: [source],
      evidenceMode: 'site',
      isComplete: true,
      error: undefined,
    })
  })

  it('marks a partial answer incomplete and exposes the stream error', () => {
    const messages = apply(
      { type: 'error', error: 'upstream unavailable' },
      { role: 'assistant', content: 'partial answer', isComplete: false },
    )

    expect(messages.at(-1)).toMatchObject({
      content: 'partial answer',
      error: 'upstream unavailable',
      isComplete: false,
    })
  })
})
