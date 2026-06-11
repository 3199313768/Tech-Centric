interface DeleteConfirmBarProps {
  message: string
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
  confirmLabel?: string
}

export function DeleteConfirmBar({
  message,
  onCancel,
  onConfirm,
  isLoading = false,
  confirmLabel = '删除',
}: DeleteConfirmBarProps) {
  return (
    <div className="sg-delete-confirm" role="alertdialog" aria-live="polite">
      <span>{message}</span>
      <div className="sg-delete-confirm__actions">
        <button
          type="button"
          className="sg-btn sg-btn--ghost sg-btn--sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          取消
        </button>
        <button
          type="button"
          className="sg-btn sg-btn--primary sg-btn--sm"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? '删除中…' : confirmLabel}
        </button>
      </div>
    </div>
  )
}
