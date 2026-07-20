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
    lexicalScore: null,
    exactMatch: false,
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
        candidate('lexical-only', { lexicalScore: 0.9 }),
        candidate('shared', { lexicalScore: 0.8 }),
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

  it('does not boost a weak lexical-only page candidate above strong vector evidence', () => {
    const result = fuseRagCandidates({
      vector: [candidate('strong-vector', { similarity: 0.95 })],
      lexical: [
        candidate('weak-page', {
          lexicalScore: 0.01,
          sourceType: 'static_project',
        }),
      ],
      pageContext: 'projects',
    })

    expect(result.candidates[0].chunkId).toBe('strong-vector')
  })

  it('does not use tags alone for page context boosting', () => {
    const result = fuseRagCandidates({
      vector: [
        candidate('generic', { similarity: 0.8 }),
        candidate('tagged', { similarity: 0.79, tags: ['projects'] }),
      ],
      lexical: [],
      pageContext: 'projects',
    })

    expect(result.candidates[0].chunkId).toBe('generic')
  })

  it('deduplicates repeated chunks within one retrieval channel', () => {
    const duplicate = candidate('duplicate', { similarity: 0.8 })
    const result = fuseRagCandidates({
      vector: [duplicate, duplicate],
      lexical: [],
      pageContext: null,
    })

    expect(result.candidates).toHaveLength(1)
    expect(result.candidates[0].matchedChannels).toEqual(['vector'])
    expect(result.candidates[0].fusedScore).toBeCloseTo(1 / 61)
  })

  it('marks weak single-channel evidence as insufficient', () => {
    const result = fuseRagCandidates({
      vector: [candidate('weak', { similarity: 0.25 })],
      lexical: [],
      pageContext: null,
    })

    expect(result.evidenceMode).toBe('insufficient')
  })

  it('marks an exact lexical match as site evidence', () => {
    const result = fuseRagCandidates({
      vector: [],
      lexical: [
        candidate('lexical', { lexicalScore: 0.9, exactMatch: true }),
      ],
      pageContext: null,
    })

    expect(result.evidenceMode).toBe('site')
  })

  it('does not treat a buried strong candidate as leading site evidence', () => {
    const result = fuseRagCandidates({
      vector: [
        candidate('weak-top', { similarity: 0.3 }),
        candidate('weak-second', { similarity: 0.29 }),
        candidate('strong-buried', { similarity: 0.95 }),
      ],
      lexical: [],
      pageContext: null,
    })

    expect(result.candidates[0].chunkId).toBe('weak-top')
    expect(result.evidenceMode).toBe('insufficient')
  })

  it('does not let a strong second-place vector override weak leading evidence', () => {
    const result = fuseRagCandidates({
      vector: [
        candidate('weak-leading', { similarity: 0.3 }),
        candidate('strong-second', { similarity: 0.95 }),
      ],
      lexical: [],
      pageContext: null,
    })

    expect(result.candidates[0].chunkId).toBe('weak-leading')
    expect(result.evidenceMode).toBe('insufficient')
  })
})
