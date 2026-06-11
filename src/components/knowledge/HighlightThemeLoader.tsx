'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

const HLJS_THEME_ID = 'kb-hljs-theme'

export function HighlightThemeLoader() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const href =
      resolvedTheme === 'dark'
        ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css'

    let link = document.getElementById(HLJS_THEME_ID) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = HLJS_THEME_ID
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    if (link.href !== href) {
      link.href = href
    }
  }, [resolvedTheme])

  return null
}
