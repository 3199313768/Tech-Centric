'use client'

interface SearchHighlightProps {
  text: string
  query: string
}

export function SearchHighlight({ text, query }: SearchHighlightProps) {
  const safeText = String(text || '')
  const trimmedQuery = query.trim()

  if (!trimmedQuery) return <span>{safeText}</span>

  let parts: string[] = []
  try {
    const regex = new RegExp(
      `(${trimmedQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`,
      'gi',
    )
    parts = safeText.split(regex)
  } catch {
    return <span>{safeText}</span>
  }

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={i} className="sg-search-highlight">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}
