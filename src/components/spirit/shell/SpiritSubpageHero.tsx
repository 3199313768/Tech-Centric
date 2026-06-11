'use client'

import Image from 'next/image'

export type SpiritSubpageTheme = 'archive' | 'herb' | 'workshop' | 'library'

export interface SpiritSubpageStat {
  label: string
  value: string | number
}

interface SpiritSubpageHeroProps {
  theme: SpiritSubpageTheme
  eyebrow: string
  title: string
  lead?: React.ReactNode
  actions?: React.ReactNode
  stats?: SpiritSubpageStat[]
  className?: string
}

const THEME_DECOR: Record<SpiritSubpageTheme, { src: string; width: number; height: number; alt: string }> = {
  archive: { src: '/spirit-garden/icon-book.png', width: 48, height: 48, alt: '' },
  herb: { src: '/spirit-garden/icon-leaf.png', width: 40, height: 40, alt: '' },
  workshop: { src: '/spirit-garden/icon-sparkle.png', width: 40, height: 40, alt: '' },
  library: { src: '/spirit-garden/icon-backpack.png', width: 44, height: 44, alt: '' },
}

export function SpiritSubpageHero({
  theme,
  eyebrow,
  title,
  lead,
  actions,
  stats,
  className = '',
}: SpiritSubpageHeroProps) {
  const decor = THEME_DECOR[theme]

  return (
    <header
      className={`sg-subpage-hero sg-subpage-hero--${theme} sg-enter ${className}`.trim()}
    >
      <div className="sg-subpage-hero__wash" aria-hidden />
      <Image
        src={decor.src}
        alt={decor.alt}
        width={decor.width}
        height={decor.height}
        className="sg-subpage-hero__decor sg-subpage-hero__decor--float"
        aria-hidden
        unoptimized
      />

      <div className="sg-subpage-hero__inner">
        <div className="sg-subpage-hero__copy">
          <p className="sg-subpage-hero__eyebrow">{eyebrow}</p>
          <h1 className="sg-subpage-hero__title">{title}</h1>
          {lead ? <p className="sg-subpage-hero__lead">{lead}</p> : null}
          {actions ? <div className="sg-subpage-hero__actions">{actions}</div> : null}
        </div>

        {stats && stats.length > 0 ? (
          <div className="sg-subpage-hero__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="sg-subpage-hero__stat">
                <span className="sg-subpage-hero__stat-value">{stat.value}</span>
                <span className="sg-subpage-hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
