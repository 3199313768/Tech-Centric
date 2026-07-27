import { describe, expect, it } from 'vitest'
import { mergeVisibleOrder } from '@/lib/projects/mergeVisibleOrder'

describe('mergeVisibleOrder', () => {
  it('returns visible order when it covers the full list', () => {
    expect(mergeVisibleOrder(['A', 'B', 'C'], ['C', 'A', 'B'])).toEqual(['C', 'A', 'B'])
  })

  it('reorders only the visible subset inside the full list', () => {
    expect(mergeVisibleOrder(['A', 'B', 'C', 'D', 'E'], ['D', 'B'])).toEqual([
      'A',
      'D',
      'C',
      'B',
      'E',
    ])
  })

  it('is a no-op when visible order is unchanged', () => {
    expect(mergeVisibleOrder(['A', 'B', 'C', 'D'], ['B', 'D'])).toEqual(['A', 'B', 'C', 'D'])
  })

  it('throws when visible ids are not a subset of full ids', () => {
    expect(() => mergeVisibleOrder(['A', 'B'], ['B', 'X'])).toThrow(/subset/i)
  })

  it('throws when visible ids contain duplicates', () => {
    expect(() => mergeVisibleOrder(['A', 'B', 'C'], ['B', 'B'])).toThrow(/duplicate/i)
  })
})
