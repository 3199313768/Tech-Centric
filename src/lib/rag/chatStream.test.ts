import { describe, expect, it, vi } from 'vitest'

import { consumeRagChatStream } from '@/lib/rag/chatStream'
import type { RagSseEvent } from '@/lib/rag/protocol'

function responseWith(events: RagSseEvent[]) {
  const body = events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('')
  return new Response(body, {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('consumeRagChatStream', () => {
  it('completes only after receiving done', async () => {
    const onEvent = vi.fn()
    const done = {
      type: 'done' as const,
      answer: 'complete',
      sources: [],
      evidenceMode: 'insufficient' as const,
      retrievalMs: 1,
      firstTokenMs: 2,
      totalMs: 3,
    }

    await expect(consumeRagChatStream(responseWith([
      { type: 'delta', text: 'draft' },
      done,
    ]), onEvent)).resolves.toBeUndefined()
    expect(onEvent).toHaveBeenLastCalledWith(done)
  })

  it('rejects an EOF-truncated stream after preserving received deltas', async () => {
    const onEvent = vi.fn()

    await expect(consumeRagChatStream(responseWith([
      { type: 'delta', text: 'partial' },
    ]), onEvent)).rejects.toThrow('回答未完整，请重试')
    expect(onEvent).toHaveBeenCalledWith({ type: 'delta', text: 'partial' })
  })

  it('rejects a server error event', async () => {
    const onEvent = vi.fn()

    await expect(consumeRagChatStream(responseWith([
      { type: 'error', error: 'provider failed' },
    ]), onEvent)).rejects.toThrow('provider failed')
    expect(onEvent).toHaveBeenCalledWith({ type: 'error', error: 'provider failed' })
  })
})
