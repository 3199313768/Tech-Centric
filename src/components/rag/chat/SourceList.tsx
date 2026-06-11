import { ExternalLink } from 'lucide-react'
import type { RagSource } from '@/lib/rag/types'

interface SourceListProps {
  sources: RagSource[]
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) return null

  return (
    <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--sg-green-light)]/70">Sources</p>
      <div className="flex flex-col gap-2">
        {sources.map((source) => {
          const safeUrl = getSafeUrl(source.url)
          const SourceWrapper = safeUrl ? 'a' : 'div'

          return (
            <SourceWrapper
              key={`${source.sourceType}-${source.title}`}
              {...(safeUrl ? { href: safeUrl } : {})}
              className="group rounded-2xl border border-white/10 bg-zinc-950/45 px-3 py-2 text-xs text-zinc-400 transition-all hover:border-[var(--sg-green-light)]/35 hover:bg-[var(--sg-green-light)]/10 hover:text-zinc-100"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="line-clamp-1 font-medium">{source.title}</span>
                {safeUrl ? <ExternalLink className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" /> : null}
              </span>
              <span className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-600">
                <span>{formatSourceType(source.sourceType)}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--sg-green-light)]/40" />
                <span>{(source.similarity * 100).toFixed(0)}%</span>
              </span>
            </SourceWrapper>
          )
        })}
      </div>
    </div>
  )
}

function formatSourceType(sourceType: string) {
  return sourceType.replace(/_/g, ' ')
}

function getSafeUrl(url: string | null) {
  if (!url) return null
  if (url.startsWith('/')) return url

  try {
    const parsed = new URL(url)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}
