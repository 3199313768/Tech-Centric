const PLATFORM_CLASS_MAP: Record<string, string> = {
  cursor: 'cursor',
  claude: 'claude',
  codex: 'codex',
  copilot: 'copilot',
  windsurf: 'windsurf',
  openai: 'openai',
  anthropic: 'anthropic',
}

const PLATFORM_ACCENT_MAP: Record<string, string> = {
  shell: 'var(--sg-platform-codex)',
  githook: 'var(--sg-platform-claude)',
  python: 'var(--sg-platform-cursor)',
  cursor: 'var(--sg-platform-cursor)',
  claude: 'var(--sg-platform-claude)',
  codex: 'var(--sg-platform-codex)',
  copilot: 'var(--sg-platform-copilot)',
  windsurf: 'var(--sg-platform-windsurf)',
  openai: 'var(--sg-platform-openai)',
  anthropic: 'var(--sg-platform-anthropic)',
}

export function getPlatformClass(platform?: string): string {
  if (!platform) return 'default'
  const key = platform.toLowerCase().replace(/[^a-z0-9]+/g, '')
  for (const [needle, cls] of Object.entries(PLATFORM_CLASS_MAP)) {
    if (key.includes(needle)) return cls
  }
  return 'default'
}

export function getPlatformAccent(platform?: string): string {
  if (!platform) return 'var(--sg-platform-default)'
  const key = platform.toLowerCase().replace(/[^a-z0-9]+/g, '')
  for (const [needle, accent] of Object.entries(PLATFORM_ACCENT_MAP)) {
    if (key.includes(needle)) return accent
  }
  return 'var(--sg-platform-default)'
}
