'use client'

import { Plus } from 'lucide-react'

export function MobileFab() {
  const triggerModal = () => {
    window.dispatchEvent(new CustomEvent('open-quick-record'))
  }

  return (
    <button
      onClick={triggerModal}
      className="fixed bottom-6 right-6 z-40 md:hidden flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 border border-indigo-400/20"
      aria-label="快速记录"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
