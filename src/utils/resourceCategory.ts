export const RESOURCE_CATEGORY_LABELS: Record<string, string> = {
  learning: '学习',
  ai: 'AI',
  tools: '工具',
  design: '设计',
  other: '其他',
}

export const RESOURCE_CATEGORY_ICONS: Record<string, string> = {
  learning: '📚',
  ai: '🤖',
  tools: '🛠️',
  design: '🎨',
  other: '🔗',
}

export const RESOURCE_CATEGORY_ACCENTS: Record<string, string> = {
  all: '#2d5a27',
  learning: 'var(--color-sky)',
  ai: 'var(--color-highlight-gold)',
  tools: 'var(--color-leaf-soft)',
  design: 'var(--color-highlight-pink)',
  other: 'var(--sg-green-light)',
}

export function getResourceAccent(category: string): string {
  return RESOURCE_CATEGORY_ACCENTS[category] ?? RESOURCE_CATEGORY_ACCENTS.other
}

export function getResourceCategoryLabel(category: string): string {
  return RESOURCE_CATEGORY_LABELS[category] ?? category
}

export function getResourceCategoryIcon(category: string): string {
  return RESOURCE_CATEGORY_ICONS[category] ?? RESOURCE_CATEGORY_ICONS.other
}
