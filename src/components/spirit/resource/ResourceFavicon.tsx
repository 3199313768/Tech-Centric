'use client'

import { useState } from 'react'
import { RESOURCE_CATEGORY_ICONS } from '@/utils/resourceCategory'

function getFaviconUrl(url: string): string {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`
  } catch {
    return ''
  }
}

interface ResourceFaviconProps {
  url: string
  category: string
  name: string
  size?: number
  className?: string
}

export function ResourceFavicon({
  url,
  category,
  name,
  size = 48,
  className = '',
}: ResourceFaviconProps) {
  const [faviconFailed, setFaviconFailed] = useState(false)
  const faviconUrl = getFaviconUrl(url)
  const useFavicon = faviconUrl && !faviconFailed
  const fallback = name?.trim()?.[0]?.toUpperCase() ?? RESOURCE_CATEGORY_ICONS[category] ?? '🔗'

  return (
    <div className={`sg-card__icon-wrap ${className}`.trim()} style={{ overflow: 'hidden' }}>
      {useFavicon ? (
        // eslint-disable-next-line @next/next/no-img-element -- 动态外部 favicon
        <img
          src={faviconUrl}
          alt=""
          width={size}
          height={size}
          onError={(e) => {
            if (!faviconUrl.includes('google.com')) {
              setFaviconFailed(true)
              return
            }
            try {
              const origin = new URL(url.startsWith('http') ? url : `https://${url}`).origin
              const fallbackUrl = `${origin}/favicon.ico`
              const img = e.currentTarget as HTMLImageElement
              if (img.src !== fallbackUrl) {
                img.src = fallbackUrl
              } else {
                setFaviconFailed(true)
              }
            } catch {
              setFaviconFailed(true)
            }
          }}
          style={{ objectFit: 'contain', width: size, height: size }}
        />
      ) : (
        <span style={{ fontSize: size >= 40 ? '2rem' : '1.25rem' }}>{fallback}</span>
      )}
    </div>
  )
}

export { getFaviconUrl }
