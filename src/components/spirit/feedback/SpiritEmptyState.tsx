import Image from 'next/image'

interface SpiritEmptyStateProps {
  title: string
  description?: string
  imageSrc?: string
  action?: React.ReactNode
  className?: string
}

export function SpiritEmptyState({
  title,
  description,
  imageSrc = '/spirit-garden/icon-leaf.png',
  action,
  className = '',
}: SpiritEmptyStateProps) {
  return (
    <div className={`sg-empty-state sg-enter ${className}`.trim()} role="status">
      <Image
        src={imageSrc}
        alt=""
        width={48}
        height={48}
        className="sg-empty-state__icon"
        aria-hidden
        unoptimized
      />
      <p className="sg-empty-state__title">{title}</p>
      {description ? <p className="sg-empty-state__desc">{description}</p> : null}
      {action ? <div className="sg-empty-state__action">{action}</div> : null}
    </div>
  )
}
