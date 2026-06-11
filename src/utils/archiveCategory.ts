import { type ProjectCategory } from '@/data/site/allProjects'

export const ARCHIVE_CATEGORY_ACCENTS: Record<ProjectCategory | '全部', string> = {
  全部: 'var(--sg-archive-all)',
  数字孪生: 'var(--sg-archive-twin)',
  后台与管理系统: 'var(--sg-archive-admin)',
  门户与展现: 'var(--sg-archive-portal)',
  未分类: 'var(--sg-archive-other)',
}

export const ARCHIVE_CATEGORY_PREFIX: Record<ProjectCategory, string> = {
  数字孪生: 'DT',
  后台与管理系统: 'ADM',
  门户与展现: 'WEB',
  未分类: 'MISC',
}

export function getArchiveAccent(category: ProjectCategory | '全部'): string {
  return ARCHIVE_CATEGORY_ACCENTS[category] ?? ARCHIVE_CATEGORY_ACCENTS['未分类']
}

export function getArchiveCode(category: ProjectCategory, index: number): string {
  const prefix = ARCHIVE_CATEGORY_PREFIX[category] ?? 'ARC'
  return `${prefix}-${String(index + 1).padStart(3, '0')}`
}
