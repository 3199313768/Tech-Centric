'use client'

import { motion } from 'framer-motion'
import { handleWatercolorHover } from '@/utils/watercolorHover'
import { getPlatformClass } from '@/utils/platformAccent'

export type SpiritListCardVariant = 'list' | 'herb' | 'scroll'

interface SpiritListCardProps {
  children: React.ReactNode
  actions?: React.ReactNode
  actionsVisible?: boolean
  onClick?: () => void
  href?: string
  className?: string
  index?: number
  variant?: SpiritListCardVariant
  platform?: string
}

const VARIANT_CLASS: Record<SpiritListCardVariant, string> = {
  list: 'sg-card--list',
  herb: 'sg-card--list sg-card--herb',
  scroll: 'sg-card--list sg-card--scroll',
}

export function SpiritListCard({
  children,
  actions,
  actionsVisible = false,
  onClick,
  href,
  className = '',
  index = 0,
  variant = 'list',
  platform,
}: SpiritListCardProps) {
  const platformClass = platform ? ` sg-card--platform-${getPlatformClass(platform)}` : ''
  const cardClass =
    `sg-card sg-card--watercolor ${VARIANT_CLASS[variant]}${platformClass} ${className}`.trim()

  const herbRotation = variant === 'herb' ? (index % 2 === 0 ? -1.2 : 1.2) : 0

  const motionProps = {
    initial: { opacity: 0, y: 30, rotate: herbRotation },
    animate: { opacity: 1, y: 0, rotate: herbRotation },
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 12,
      delay: index * 0.1,
    },
    onMouseMove: handleWatercolorHover,
  }

  const inner = (
    <>
      {variant === 'scroll' && platform ? (
        <div className="sg-card__platform-ribbon">{platform}</div>
      ) : null}
      {actions ? (
        <div className={`sg-card__actions${actionsVisible ? ' sg-card__actions--visible' : ''}`}>
          {actions}
        </div>
      ) : null}
      {children}
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClass}
        {...motionProps}
      >
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cardClass}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      {...motionProps}
    >
      {inner}
    </motion.div>
  )
}
