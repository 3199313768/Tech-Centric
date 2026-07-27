import { describe, expect, it } from 'vitest'
import { assertCompleteProjectOrder } from '@/lib/projects/assertCompleteProjectOrder'

describe('assertCompleteProjectOrder', () => {
  it('accepts a permutation of existing ids', () => {
    expect(assertCompleteProjectOrder(['b', 'a', 'c'], ['a', 'b', 'c'])).toBeNull()
  })

  it('rejects length mismatch', () => {
    expect(assertCompleteProjectOrder(['a'], ['a', 'b'])).toMatch(/数量/)
  })

  it('rejects duplicates', () => {
    expect(assertCompleteProjectOrder(['a', 'a'], ['a', 'b'])).toMatch(/重复/)
  })

  it('rejects unknown ids', () => {
    expect(assertCompleteProjectOrder(['a', 'x'], ['a', 'b'])).toMatch(/未知/)
  })
})
