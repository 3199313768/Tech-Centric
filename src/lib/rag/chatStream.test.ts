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
  it('returns and cancels the reader immediately after done without waiting for EOF', async () => {
    const cancel = vi.fn()
    const done = {
      type: 'done' as const,
      answer: 'complete',
      sources: [],
      evidenceMode: 'insufficient' as const,
      retrievalMs: 1,
      firstTokenMs: 2,
      totalMs: 3,
    }
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify(done)}\n\n`,
        ))
      },
      cancel,
    })

    const outcome = await Promise.race([
      consumeRagChatStream(new Response(stream), vi.fn()).then(() => 'completed'),
      new Promise<string>(resolve => setTimeout(() => resolve('timed-out'), 50)),
    ])

    expect(outcome).toBe('completed')
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('cancels the reader when the event callback throws', async () => {
    const cancel = vi.fn()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify({ type: 'delta', text: 'partial' })}\n\n`,
        ))
      },
      cancel,
    })

    await expect(consumeRagChatStream(new Response(stream), () => {
      throw new Error('render failed')
    })).rejects.toThrow('render failed')
    expect(cancel).toHaveBeenCalledOnce()
  })

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
