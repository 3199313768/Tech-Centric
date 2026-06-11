'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/spirit/theme/ThemeToggle'

export function KnowledgeNav() {
  return (
    <nav className="sg-nav">
      <div className="sg-nav-inner">
        <Link href="/" className="sg-nav-brand" aria-label="返回 SpiritGarden 庭院">
          <Image src="/spirit-garden/logo.png" alt="" width={40} height={40} />
          <span>SpiritGarden</span>
        </Link>

        <div className="sg-nav-links">
          <Link href="/" className="sg-nav-link">
            返回庭院
          </Link>
          <span className="sg-nav-link sg-nav-link--active">档案馆</span>
        </div>

        <div className="sg-nav-actions">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
