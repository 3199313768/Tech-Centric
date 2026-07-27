/** 账号可省略域名：admin → admin@spiritgarden.local */
export const LOGIN_EMAIL_DOMAIN = 'spiritgarden.local'

export function resolveLoginEmail(accountOrEmail: string): string {
  const trimmed = accountOrEmail.trim()
  if (!trimmed) return trimmed
  if (trimmed.includes('@')) return trimmed
  return `${trimmed}@${LOGIN_EMAIL_DOMAIN}`
}
