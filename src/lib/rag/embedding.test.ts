import { beforeEach, describe, expect, it, vi } from 'vitest'

import { proxyFetch } from '@/lib/rag/proxyFetch'

vi.mock('@/lib/rag/proxyFetch', () => ({ proxyFetch: vi.fn() }))

import { createEmbedding } from '@/lib/rag/embedding'

describe('createEmbedding cancellation', () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key'
    vi.mocked(proxyFetch).mockReset()
  })

  it('does not retry a caller-aborted request', async () => {
    const controller = new AbortController()
    vi.mocked(proxyFetch).mockImplementation((_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted', 'AbortError'))
        }, { once: true })
      }),
    )

    const result = createEmbedding('question', controller.signal)
    controller.abort()

    await expect(result).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(proxyFetch).toHaveBeenCalledTimes(1)
  })
})
