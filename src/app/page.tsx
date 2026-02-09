'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { PhysicsWorld } from '@/components/PhysicsWorld'
import { About } from '@/components/About'
import { Experience } from '@/components/Experience'
import { Skills } from '@/components/Skills'
import { Stats } from '@/components/Stats'
import { Blog } from '@/components/Blog'
import { Achievements } from '@/components/Achievements'
import { Contact } from '@/components/Contact'
import { LifeLog } from '@/components/LifeLog'
import { YearlyReview } from '@/components/YearlyReview'
import { Recommendations } from '@/components/Recommendations'
import { TravelMap } from '@/components/TravelMap'
import { Projects } from '@/components/Projects'
import { motion } from 'framer-motion'

export default function Home() {
  const [activeTab, setActiveTab] = useState('home')
  const [currentPage, setCurrentPage] = useState(1)

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
          <div style={{ position: 'relative', backgroundColor: '#0a0a0a' }}>
            {/* Hero 区域 - 封面页 */}
            <section style={{ position: 'relative' }}>
              <PhysicsWorld showHero={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: '80px 0' }} />
            
            {/* 关于我 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <About compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: '80px 0' }} />
            
            {/* 技能 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Skills compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: '80px 0' }} />
            
            {/* 工作经历 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Experience compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: '80px 0' }} />
            
            {/* 作品集 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Projects compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: '80px 0' }} />
            
            {/* 统计 */}
            <section style={{ position: 'relative', zIndex: 10 }}>
              <Stats compact={true} />
            </section>
            
            {/* 杂志式分割线 */}
            <div className="magazine-divider" style={{ margin: '80px 0' }} />
            
            {/* 成就 */}
            <section style={{ position: 'relative', zIndex: 10, paddingBottom: '120px' }}>
              <Achievements compact={true} />
            </section>
          </div>
        )
      case 'blog':
        return <Blog />
      case 'lifelog':
        return <LifeLog />
      case 'yearlyreview':
        return <YearlyReview />
      case 'recommendations':
        return <Recommendations />
      case 'travel':
        return <TravelMap />
      case 'contact':
        return <Contact />
      default:
        return <PhysicsWorld />
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', position: 'relative' }}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
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
