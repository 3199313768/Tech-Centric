import { describe, expect, it, vi } from 'vitest'

import { retrieveRagCandidates } from '@/lib/rag/retrieval'
import type { RagRetrievalCandidate } from '@/lib/rag/types'

function candidate(
  chunkId: string,
  overrides: Partial<RagRetrievalCandidate> = {},
): RagRetrievalCandidate {
  return {
    chunkId,
    documentId: `document-${chunkId}`,
    sourceId: `source-${chunkId}`,
    content: `content-${chunkId}`,
    excerpt: `content-${chunkId}`,
    title: `title-${chunkId}`,
    url: `/${chunkId}`,
    sourceType: 'static_personal',
    tags: [],
    similarity: null,
    lexicalScore: null,
    exactMatch: false,
    ...overrides,
  }
}

describe('retrieveRagCandidates', () => {
  it('returns candidates from both successful retrieval channels', async () => {
    const vector = [candidate('vector', { similarity: 0.82 })]
    const lexical = [candidate('lexical', { lexicalScore: 1.4 })]

    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], {
        vector: vi.fn().mockResolvedValue(vector),
        lexical: vi.fn().mockResolvedValue(lexical),
      }),
    ).resolves.toEqual({ vector, lexical })
  })

  it('falls back to lexical candidates when vector retrieval fails', async () => {
    const lexical = [candidate('lexical', { lexicalScore: 1.4 })]

    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], {
        vector: vi.fn().mockRejectedValue(new Error('vector unavailable')),
        lexical: vi.fn().mockResolvedValue(lexical),
      }),
    ).resolves.toEqual({ vector: [], lexical })
  })

  it('falls back to vector candidates when lexical retrieval fails', async () => {
    const vector = [candidate('vector', { similarity: 0.82 })]

    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], {
        vector: vi.fn().mockResolvedValue(vector),
        lexical: vi.fn().mockRejectedValue(new Error('lexical unavailable')),
      }),
    ).resolves.toEqual({ vector, lexical: [] })
  })

  it('throws a safe error when both retrieval channels fail', async () => {
    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], {
        vector: vi.fn().mockRejectedValue(new Error('vector unavailable')),
        lexical: vi.fn().mockRejectedValue(new Error('lexical unavailable')),
      }),
    ).rejects.toThrow('RAG retrieval failed')
  })
})
