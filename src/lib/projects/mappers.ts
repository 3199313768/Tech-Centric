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
}

export function mapAllProjectRow(row: AllProjectRow): AllProjectItem {
  const slug = row.slug?.trim() || buildProjectSlug(row.name, row.id)

  return {
    id: row.id,
    slug,
    name: row.name,
    url: row.url,
    isPublic: row.is_public,
    category: row.category as ProjectCategory,
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
  }
}
