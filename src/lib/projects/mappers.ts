import type { AllProjectItem, ProjectCategory } from '@/data/site/allProjects'
import { buildProjectSlug } from '@/lib/projects/slug'

export interface AllProjectRow {
  id: string
  name: string
  url: string
  is_public: boolean
  category: string
  description: string
  role_and_contribution: string
  tags: string[]
  screenshots: string[]
  slug?: string | null
  body?: string | null
  highlights?: string[] | null
  tech_stack?: string[] | null
  period?: string | null
  role?: string | null
  is_featured?: boolean | null
  sort_order?: number | null
}

/** 历史「后台与管理系统」并入「数字孪生」。 */
function normalizeProjectCategory(category: string): ProjectCategory {
  if (category === '后台与管理系统') return '数字孪生'
  if (category === '数字孪生' || category === '门户与展现' || category === '未分类') {
    return category
  }
  return '未分类'
}

export function mapAllProjectRow(row: AllProjectRow): AllProjectItem {
  const slug = row.slug?.trim() || buildProjectSlug(row.name, row.id)

  return {
    id: row.id,
    slug,
    name: row.name,
    url: row.url,
    isPublic: row.is_public,
    category: normalizeProjectCategory(row.category),
    description: row.description,
    roleAndContribution: row.role_and_contribution,
    tags: row.tags ?? [],
    screenshots: row.screenshots ?? [],
    body: row.body ?? '',
    highlights: row.highlights ?? [],
    techStack: row.tech_stack ?? [],
    period: row.period ?? '',
    role: row.role ?? '',
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order ?? 0,
  }
}
