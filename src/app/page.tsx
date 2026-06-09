'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { SpiritGardenHome } from '@/components/SpiritGardenHome'

const AiSkills = dynamic(() => import('@/components/AiSkills').then((m) => ({ default: m.AiSkills })))
const VibeCoding = dynamic(() => import('@/components/VibeCoding').then((m) => ({ default: m.VibeCoding })))
const ResourceLinks = dynamic(() =>
  import('@/components/ResourceLinks').then((m) => ({ default: m.ResourceLinks })),
)
const AllProjects = dynamic(() => import('@/components/AllProjects').then((m) => ({ default: m.AllProjects })))
const FloatingAssistant = dynamic(
  () => import('@/components/rag/FloatingAssistant').then((m) => ({ default: m.FloatingAssistant })),
  { ssr: false },
)
const SpiritCursorTrail = dynamic(
  () => import('@/components/SpiritCursorTrail').then((m) => ({ default: m.SpiritCursorTrail })),
  { ssr: false },
)
const SpiritCursor = dynamic(
  () => import('@/components/SpiritCursor').then((m) => ({ default: m.SpiritCursor })),
  { ssr: false },
)

export default function Home() {
  const [activeTab, setActiveTab] = useState('home')
  const isHome = activeTab === 'home'

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <SpiritGardenHome onNavigate={handleTabChange} />
      case 'ai-skills':
        return (
          <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
            <AiSkills />
          </div>
        )
      case 'vibe-coding':
        return (
          <div className="spirit-garden-content sg-subpage sg-subpage--herb">
            <VibeCoding />
          </div>
        )
      case 'all-projects':
        return (
          <div className="spirit-garden-content sg-subpage sg-subpage--archive">
            <AllProjects />
          </div>
        )
      case 'resources':
        return (
          <div className="spirit-garden-content sg-subpage sg-subpage--library">
            <ResourceLinks />
          </div>
        )
      default:
        return <SpiritGardenHome />
    }
  }

  return (
    <div className={`spirit-garden-shell${isHome ? ' spirit-garden-shell--home' : ''}`}>
      {isHome ? (
        <>
          <SpiritCursorTrail />
          <SpiritCursor />
        </>
      ) : null}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} transparent={isHome} />
      {renderContent()}
      {isHome ? <FloatingAssistant /> : null}
    </div>
  )
}
