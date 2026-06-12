import type { MetadataRoute } from 'next'

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
