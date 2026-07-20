import { describe, expect, it } from 'vitest'

import { fuseRagCandidates } from '@/lib/rag/fusion'
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
    excerpt: `excerpt-${chunkId}`,
    title: `title-${chunkId}`,
    url: `/${chunkId}`,
    sourceType: 'static_personal',
    tags: [],
    similarity: null,
    lexicalRank: null,
    ...overrides,
  }
}

describe('fuseRagCandidates', () => {
  it('returns insufficient evidence when all candidate sources are empty', () => {
    expect(
      fuseRagCandidates({
        vector: [],
        lexical: [],
        pageContext: null,
      }),
    ).toEqual({
      candidates: [],
      evidenceMode: 'insufficient',
    })
  })

  it('ranks a candidate matched by both retrieval channels first', () => {
    const shared = candidate('shared', { similarity: 0.78 })

    const result = fuseRagCandidates({
      vector: [candidate('vector-only', { similarity: 0.9 }), shared],
      lexical: [
        candidate('lexical-only', { lexicalRank: 1 }),
        candidate('shared', { lexicalRank: 2 }),
      ],
      pageContext: null,
    })

    expect(result.candidates[0]).toMatchObject({
      chunkId: 'shared',
      matchedChannels: ['vector', 'lexical'],
    })
    expect(result.evidenceMode).toBe('site')
  })

  it('returns at most two chunks from the same document and eight overall', () => {
    const vector = Array.from({ length: 12 }, (_, index) =>
      candidate(`chunk-${index}`, {
        documentId: index < 5 ? 'repeated-document' : `document-${index}`,
        similarity: 0.95 - index * 0.01,
      }),
    )

    const result = fuseRagCandidates({ vector, lexical: [], pageContext: null })

    expect(result.candidates).toHaveLength(8)
    expect(
      result.candidates.filter(
        (item) => item.documentId === 'repeated-document',
      ),
    ).toHaveLength(2)
  })

  it('uses page context only as a bounded tie-breaker', () => {
    const closeResult = fuseRagCandidates({
      vector: [
        candidate('generic-close', { similarity: 0.8 }),
        candidate('project-close', {
          similarity: 0.79,
          sourceType: 'static_project',
        }),
      ],
      lexical: [],
      pageContext: 'projects',
    })
    const weakResult = fuseRagCandidates({
      vector: [
        candidate('strong-generic', { similarity: 0.95 }),
        candidate('weak-project', {
          similarity: 0.3,
          sourceType: 'static_project',
        }),
      ],
      lexical: [],
      pageContext: 'projects',
    })

    expect(closeResult.candidates[0].chunkId).toBe('project-close')
    expect(weakResult.candidates[0].chunkId).toBe('strong-generic')
  })

  it('marks weak single-channel evidence as insufficient', () => {
    const result = fuseRagCandidates({
      vector: [candidate('weak', { similarity: 0.25 })],
      lexical: [],
      pageContext: null,
    })

    expect(result.evidenceMode).toBe('insufficient')
  })

  it('marks explicit lexical evidence as site evidence', () => {
    const result = fuseRagCandidates({
      vector: [],
      lexical: [candidate('lexical', { lexicalRank: 1 })],
      pageContext: null,
    })

    expect(result.evidenceMode).toBe('site')
  })
})
