import { describe, expect, it } from 'vitest'

import { fuseRagCandidates } from '@/lib/rag/fusion'

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
})
