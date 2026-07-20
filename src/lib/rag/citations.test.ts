import { describe, expect, it } from 'vitest'

import { assignContextIds, finalizeCitations } from '@/lib/rag/citations'
import type { FusedRagCandidate } from '@/lib/rag/types'

function candidate(
  chunkId: string,
  overrides: Partial<FusedRagCandidate> = {},
): FusedRagCandidate {
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
    fusedScore: 1,
    matchedChannels: ['vector'],
    ...overrides,
  }
}

describe('assignContextIds', () => {
  it('assigns stable S1-based IDs in candidate order', () => {
    const candidates = [candidate('first'), candidate('second')]

    expect(assignContextIds(candidates).map(({ contextId }) => contextId)).toEqual([
      'S1',
      'S2',
    ])
    expect(candidates).not.toHaveProperty('0.contextId')
  })
})

describe('finalizeCitations', () => {
  const contexts = assignContextIds([
    candidate('first'),
    candidate('second', { sourceType: 'static_project' }),
    candidate('third'),
  ])

  it('returns only sources actually cited by the answer', () => {
    const result = finalizeCitations('The second source applies [S2].', contexts)

    expect(result.sources).toEqual([
      {
        citation: 1,
        sourceId: 'source-second',
        title: 'title-second',
        url: '/second',
        sourceType: 'static_project',
        excerpt: 'excerpt-second',
      },
    ])
  })

  it('deduplicates repeated citations and preserves first-use order', () => {
    const result = finalizeCitations(
      'Third [S3], then first [S1], and third again [S3].',
      contexts,
    )

    expect(result.answer).toBe('Third [1], then first [2], and third again [1].')
    expect(result.sources.map(({ sourceId }) => sourceId)).toEqual([
      'source-third',
      'source-first',
    ])
  })

  it('removes unknown citation IDs without leaving doubled spaces', () => {
    const result = finalizeCitations(
      'Known [S1] and unknown [S99] marker.',
      contexts,
    )

    expect(result.answer).toBe('Known [1] and unknown marker.')
    expect(result.answer).not.toContain('  ')
  })

  it('converts an internal S2 marker to visitor-facing citation 1', () => {
    expect(finalizeCitations('Use this [S2].', contexts).answer).toBe(
      'Use this [1].',
    )
  })

  it('returns no sources when the answer has no valid citations', () => {
    expect(finalizeCitations('Unsupported [S99].', contexts)).toEqual({
      answer: 'Unsupported.',
      sources: [],
    })
  })
})
