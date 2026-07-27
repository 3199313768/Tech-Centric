import { describe, expect, it } from 'vitest'
import { resolveLoginEmail } from '@/lib/auth/loginIdentity'

describe('resolveLoginEmail', () => {
  it('maps bare account to spiritgarden.local', () => {
    expect(resolveLoginEmail('admin')).toBe('admin@spiritgarden.local')
  })

  it('keeps full email unchanged', () => {
    expect(resolveLoginEmail('admin@spiritgarden.local')).toBe('admin@spiritgarden.local')
    expect(resolveLoginEmail('user@example.com')).toBe('user@example.com')
  })

  it('trims whitespace', () => {
    expect(resolveLoginEmail('  admin  ')).toBe('admin@spiritgarden.local')
  })
})
