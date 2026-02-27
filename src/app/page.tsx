'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { PhysicsWorld } from '@/components/PhysicsWorld'
import { About } from '@/components/About'
import { Experience } from '@/components/Experience'
import { Skills } from '@/components/Skills'
import { Stats } from '@/components/Stats'
import { Achievements } from '@/components/Achievements'
import { ContactChat } from '@/components/ContactChat'
import { YearlyReview } from '@/components/YearlyReview'
import { TravelMap } from '@/components/TravelMap'
import { Projects } from '@/components/Projects'
import { AiSkills } from '@/components/AiSkills'
import { VibeCoding } from '@/components/VibeCoding'
import { ResourceLinks } from '@/components/ResourceLinks'
import { motion } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'

export default function Home() {
  const [activeTab, setActiveTab] = useState('home')
  const [currentPage, setCurrentPage] = useState(1)
  const { isMobile, isTablet } = useBreakpoint()
  const dividerMargin = isMobile ? '40px 0' : isTablet ? '60px 0' : '80px 0'

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section, [id]')
      const scrollPosition = window.scrollY + window.innerHeight / 2

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const sectionTop = rect.top + window.scrollY
        const sectionBottom = sectionTop + rect.height

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setCurrentPage(index + 1)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={{ position: 'relative', backgroundColor: 'var(--color-bg)' }}>
            {/* Hero 区域 - 封面页 */}
            <section style={{ position: 'relative' }}>
              <PhysicsWorld showHero={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: dividerMargin }} />
            
            {/* 关于我 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <About compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: dividerMargin }} />
            
            {/* 技能 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Skills compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: dividerMargin }} />
            
            {/* 工作经历 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Experience compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: dividerMargin }} />
            
            {/* 作品集 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Projects compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: dividerMargin }} />
            
            {/* 统计 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Stats compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: dividerMargin }} />
            
            {/* 成就 */}
            <section style={{ position: 'relative', zIndex: 10, paddingBottom: isMobile ? '60px' : '120px' }}>
              <Achievements compact={true} />
            </section>
          </div>
        )
      case 'ai-skills':
        return <AiSkills />
      case 'vibe-coding':
        return <VibeCoding />
      case 'yearlyreview':
        return <YearlyReview />
      case 'resources':
        return <ResourceLinks />
      case 'travel':
        return <TravelMap />
      case 'contact':
        return <ContactChat />
      default:
        return <PhysicsWorld />
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', position: 'relative' }}>
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* 页码显示 - 仅在首页显示 */}
      {activeTab === 'home' && (
        <motion.div
          className="magazine-page-number"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {currentPage}
        </motion.div>
      )}
      
      {renderContent()}
    </div>
  )
}
