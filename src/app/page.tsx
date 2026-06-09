'use client'

import { useState, useEffect, useRef } from 'react'
import { Navigation } from '@/components/Navigation'
import { PhysicsWorld } from '@/components/PhysicsWorld'
import { About } from '@/components/About'
import { Experience } from '@/components/Experience'
import { Skills } from '@/components/Skills'
import { Achievements } from '@/components/Achievements'
import { AiSkills } from '@/components/AiSkills'
import { VibeCoding } from '@/components/VibeCoding'
import { ResourceLinks } from '@/components/ResourceLinks'
import { AllProjects } from '@/components/AllProjects'
import { FloatingAssistant } from '@/components/rag/FloatingAssistant'
import { motion } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'

const HOME_SECTION_IDS = ['hero', 'about', 'skills', 'experience', 'achievements']

export default function Home() {
  const [activeTab, setActiveTab] = useState('home')
  const [currentPage, setCurrentPage] = useState(1)
  const lastPageRef = useRef(1)
  const { isMobile, isTablet } = useBreakpoint()
  const dividerMargin = isMobile ? '40px 0' : isTablet ? '60px 0' : '80px 0'

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'home') {
      lastPageRef.current = 1
      setCurrentPage(1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (activeTab !== 'home') return

    let ticking = false
    const sections = HOME_SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    const updateCurrentPage = () => {
      if (sections.length === 0) return

      const scrollPosition = window.scrollY + window.innerHeight / 2
      let nextPage = lastPageRef.current

      for (let i = 0; i < sections.length; i += 1) {
        const rect = sections[i].getBoundingClientRect()
        const sectionTop = rect.top + window.scrollY
        const sectionBottom = sectionTop + rect.height
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          nextPage = i + 1
          break
        }
      }

      const firstRect = sections[0].getBoundingClientRect()
      const firstTop = firstRect.top + window.scrollY
      if (scrollPosition < firstTop) nextPage = 1

      const lastRect = sections[sections.length - 1].getBoundingClientRect()
      const lastTop = lastRect.top + window.scrollY
      const lastBottom = lastTop + lastRect.height
      if (scrollPosition >= lastBottom) nextPage = sections.length

      if (nextPage !== lastPageRef.current) {
        lastPageRef.current = nextPage
        setCurrentPage(nextPage)
      }
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateCurrentPage()
          ticking = false
        })
        ticking = true
      }
    }

    updateCurrentPage()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeTab])

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={{ position: 'relative', backgroundColor: 'var(--color-bg)' }}>
            {/* Hero 区域 - 封面页 */}
            <section id="hero" style={{ position: 'relative' }}>
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
      case 'all-projects':
        return <AllProjects />
      case 'resources':
        return <ResourceLinks />
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
      {activeTab === 'home' ? <FloatingAssistant /> : null}
    </div>
  )
}
