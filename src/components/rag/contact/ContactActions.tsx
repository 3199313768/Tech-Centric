import type { MessageAction } from '@/lib/rag/types'

interface ContactActionsProps {
  actions: MessageAction[]
  onAction: (actionId: string) => void
}

const actionClassName = {
  primary: 'sg-rag-action-btn sg-rag-action-btn--primary',
  secondary: 'sg-rag-action-btn sg-rag-action-btn--secondary',
  ghost: 'sg-rag-action-btn sg-rag-action-btn--ghost',
}

export function ContactActions({ actions, onAction }: ContactActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="sg-rag-actions">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction(action.id)}
          className={actionClassName[action.kind]}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
