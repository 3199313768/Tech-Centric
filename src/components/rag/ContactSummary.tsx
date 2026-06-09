import type { ContactSummaryData } from '@/lib/rag/types'

interface ContactSummaryProps {
  summary: ContactSummaryData
}

export function ContactSummary({ summary }: ContactSummaryProps) {
  return (
    <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-zinc-950/50 p-3 text-xs text-zinc-300">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Email Draft</p>
      <div className="mt-2 space-y-2">
        <p><span className="text-zinc-500">To:</span> {summary.email}</p>
        <p><span className="text-zinc-500">Phone:</span> {summary.phone}</p>
        <p><span className="text-zinc-500">Subject:</span> {summary.subject}</p>
        <pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl bg-black/20 p-3 font-sans leading-5 text-zinc-300">
          {summary.body}
        </pre>
      </div>
    </div>
  )
}
