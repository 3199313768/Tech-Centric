import { describe, expect, it, vi } from 'vitest'

import {
  getOrCreateRagSessionId,
  persistRagSessionId,
} from '@/lib/rag/session'

const sessionId = '11111111-1111-4111-8111-111111111111'

describe('RAG session storage', () => {
  it('returns a generated UUID when reading storage throws', () => {
    const storage = {
      getItem: vi.fn(() => { throw new Error('blocked') }),
      setItem: vi.fn(),
    }

    expect(getOrCreateRagSessionId(storage)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('ignores storage write failures', () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(() => { throw new Error('quota exceeded') }),
    }

    expect(() => persistRagSessionId(sessionId, storage)).not.toThrow()
  })
})
