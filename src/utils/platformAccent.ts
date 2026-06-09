const PLATFORM_CLASS_MAP: Record<string, string> = {
  cursor: 'cursor',
  claude: 'claude',
  codex: 'codex',
  copilot: 'copilot',
  windsurf: 'windsurf',
  openai: 'openai',
  anthropic: 'anthropic',
}

export function getPlatformClass(platform?: string): string {
  if (!platform) return 'default'
  const key = platform.toLowerCase().replace(/[^a-z0-9]+/g, '')
  for (const [needle, cls] of Object.entries(PLATFORM_CLASS_MAP)) {
    if (key.includes(needle)) return cls
  }
  return 'default'
}
