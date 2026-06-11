interface SpiritLoadingIndicatorProps {
  label?: string
}

export function SpiritLoadingIndicator({ label }: SpiritLoadingIndicatorProps) {
  return (
    <div className="sg-loading-indicator" role="status" aria-live="polite">
      <span className="sg-loading-indicator__glyph" aria-hidden>
        <span className="sg-loading-indicator__dot" />
        <span className="sg-loading-indicator__dot" />
        <span className="sg-loading-indicator__dot" />
      </span>
      {label ? <p className="sg-loading-indicator__label">{label}</p> : null}
    </div>
  )
}
