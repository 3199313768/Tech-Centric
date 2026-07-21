import { describe, expect, it } from 'vitest'

import { getRagPageContextKey } from '@/lib/rag/pageContext'

describe('getRagPageContextKey', () => {
  it.each([
    ['/projects/example', 'projects'],
    ['/skills', 'skills'],
    ['/knowledge/record', 'knowledge'],
    ['/resources', 'resources'],
    ['/vibe/post', 'vibe'],
    ['/about', 'about'],
    ['/showcase', 'showcase'],
    ['/search', 'search'],
    ['/stats', 'stats'],
  ] as const)('maps %s to %s', (pathname, expected) => {
    expect(getRagPageContextKey(pathname)).toBe(expected)
  })

  it('omits unsupported routes', () => {
    expect(getRagPageContextKey('/')).toBeNull()
    expect(getRagPageContextKey('/studio')).toBeNull()
  })
})
