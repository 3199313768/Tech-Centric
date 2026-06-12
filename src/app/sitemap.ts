import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_ROUTES, projectRoute, vibeRoute, knowledgePublicRoute } from '@/lib/site/routes'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}${SITE_ROUTES.home}`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}${SITE_ROUTES.projects}`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}${SITE_ROUTES.skills}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}${SITE_ROUTES.vibe}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}${SITE_ROUTES.resources}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}${SITE_ROUTES.knowledge}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}${SITE_ROUTES.about}`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}${SITE_ROUTES.showcase}`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}${SITE_ROUTES.search}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}${SITE_ROUTES.changelog}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}${SITE_ROUTES.stats}`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ]

  try {
    const supabase = await createClient()

    const [projects, vibes, kb] = await Promise.all([
      supabase.from('all_projects').select('slug, created_at').eq('is_public', true),
      supabase.from('vibe_coding').select('slug, id, created_at').eq('is_public', true),
      supabase.from('kb_records').select('id, updated_at').eq('is_public', true),
    ])

    const projectRoutes: MetadataRoute.Sitemap = (projects.data ?? [])
      .filter((row) => Boolean(row.slug))
      .map((row) => ({
      url: `${baseUrl}${projectRoute(row.slug)}`,
      lastModified: row.created_at ? new Date(row.created_at) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

    const vibeRoutes: MetadataRoute.Sitemap = (vibes.data ?? []).map((row) => ({
      url: `${baseUrl}${vibeRoute(row.slug ?? row.id)}`,
      lastModified: row.created_at ? new Date(row.created_at) : now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    const kbRoutes: MetadataRoute.Sitemap = (kb.data ?? []).map((row) => ({
      url: `${baseUrl}${knowledgePublicRoute(row.id)}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...projectRoutes, ...vibeRoutes, ...kbRoutes]
  } catch {
    return staticRoutes
  }
}
