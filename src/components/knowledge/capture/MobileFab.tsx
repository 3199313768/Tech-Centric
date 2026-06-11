'use client'

import { Plus } from 'lucide-react'

export function MobileFab() {
  const triggerModal = () => {
    window.dispatchEvent(new CustomEvent('open-quick-record'))
  }

  return (
    <button
      type="button"
      onClick={triggerModal}
      className="sg-fab md:hidden"
      aria-label="快速记录"
    >
      <Plus className="sg-fab__icon" aria-hidden />
    </button>
  )
}
