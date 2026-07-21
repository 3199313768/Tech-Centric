import { readFileSync } from 'node:fs'
import { join } from 'node:path'

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
  it('passes the operation signal to both retrieval channels', async () => {
    const controller = new AbortController()
    const vector = vi.fn().mockResolvedValue([])
    const lexical = vi.fn().mockResolvedValue([])

    await retrieveRagCandidates('React', [0.1, 0.2], controller.signal, {
      vector,
      lexical,
    })

    expect(vector).toHaveBeenCalledWith([0.1, 0.2], controller.signal)
    expect(lexical).toHaveBeenCalledWith('React', controller.signal)
  })

  it('preserves cancellation instead of converting it to retrieval failure', async () => {
    const controller = new AbortController()
    const aborted = new DOMException('aborted', 'AbortError')
    const result = retrieveRagCandidates('React', [0.1], controller.signal, {
      vector: vi.fn().mockRejectedValue(aborted),
      lexical: vi.fn().mockRejectedValue(aborted),
    })
    controller.abort()

    await expect(result).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('returns candidates from both successful retrieval channels', async () => {
    const vector = [candidate('vector', { similarity: 0.82 })]
    const lexical = [candidate('lexical', { lexicalScore: 1.4 })]

    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], undefined, {
        vector: vi.fn().mockResolvedValue(vector),
        lexical: vi.fn().mockResolvedValue(lexical),
      }),
    ).resolves.toEqual({ vector, lexical })
  })

  it('falls back to lexical candidates when vector retrieval fails', async () => {
    const lexical = [candidate('lexical', { lexicalScore: 1.4 })]

    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], undefined, {
        vector: vi.fn().mockRejectedValue(new Error('vector unavailable')),
        lexical: vi.fn().mockResolvedValue(lexical),
      }),
    ).resolves.toEqual({ vector: [], lexical })
  })

  it('falls back to vector candidates when lexical retrieval fails', async () => {
    const vector = [candidate('vector', { similarity: 0.82 })]

    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], undefined, {
        vector: vi.fn().mockResolvedValue(vector),
        lexical: vi.fn().mockRejectedValue(new Error('lexical unavailable')),
      }),
    ).resolves.toEqual({ vector, lexical: [] })
  })

  it('throws a safe error when both retrieval channels fail', async () => {
    await expect(
      retrieveRagCandidates('React', [0.1, 0.2], undefined, {
        vector: vi.fn().mockRejectedValue(new Error('vector unavailable')),
        lexical: vi.fn().mockRejectedValue(new Error('lexical unavailable')),
      }),
    ).rejects.toThrow('RAG retrieval failed')
  })
})

describe('hybrid retrieval SQL patch', () => {
  const sql = readFileSync(
    join(process.cwd(), 'scripts/sql/patch-rag-hybrid-search-feedback.sql'),
    'utf8',
  ).toLowerCase()

  it('uses literal substring matching and indexes chunk full-text search', () => {
    expect(sql).not.toContain(' ilike ')
    expect(sql).not.toContain(' or strpos')
    expect(sql).toContain('strpos(')
    expect(sql).toContain('using gin')
    expect(sql).toContain("to_tsvector('simple', content)")
    expect(sql).toContain('content_matches')
    expect(sql).toContain('metadata_documents')
    expect(sql).toContain('union all')
    expect(sql).toContain('sum(lexical_score)')
  })

  it('runs both RPCs with invoker privileges restricted to service role', () => {
    expect(sql).not.toContain('security definer')
    expect(sql).not.toContain('set search_path')
    expect(sql).toContain('from public;')
    expect(sql).toContain('to service_role;')
  })

  it('bounds candidate counts and keeps at most two chunks per document', () => {
    expect(sql).toContain('greatest(1, least(match_count, 50))')
    expect(sql).toContain('row_number() over')
    expect(sql).toContain('partition by document_id')
    expect(sql).toContain('doc_rank <= 2')
  })
})
