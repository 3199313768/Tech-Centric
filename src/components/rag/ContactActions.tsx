import type { MessageAction } from '@/lib/rag/types'

interface ContactActionsProps {
  actions: MessageAction[]
  onAction: (actionId: string) => void
}

const actionClassName = {
  primary: 'border-[var(--sg-green-light)]/40 bg-[var(--sg-green-deep)] text-[var(--sg-cream)] hover:bg-[var(--sg-green-mid)]',
  secondary: 'border-white/10 bg-white/[0.08] text-zinc-100 hover:border-[var(--sg-green-light)]/35 hover:bg-[var(--sg-green-light)]/10',
  ghost: 'border-transparent bg-transparent text-zinc-400 hover:text-[var(--sg-green-light)]',
}

export function ContactActions({ actions, onAction }: ContactActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${actionClassName[action.kind]}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
