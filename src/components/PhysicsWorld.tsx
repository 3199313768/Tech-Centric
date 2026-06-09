'use client'

import { Hero } from './Hero'
import { motion } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'

interface PhysicsWorldProps {
  className?: string
  showHero?: boolean
}

export function PhysicsWorld({ showHero = true }: PhysicsWorldProps) {
  const { isMobile, isTablet } = useBreakpoint()

  return (
    <>
      {/* 静态噪音纹理 - 在最底层 */}
      <div className="static-noise" style={{ zIndex: 1 }} />
      
      {/* Hero 区域容器 - 日式奇幻动画封面 */}
      {showHero && (
        <motion.div
          className="anime-hero-stage"
          style={{
            position: 'relative',
            zIndex: 2,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="anime-sky-wash" />
          <div className="anime-cloud anime-cloud-left" />
          <div className="anime-cloud anime-cloud-right" />
          <div className="anime-mountain anime-mountain-back" />
          <div className="anime-mountain anime-mountain-front" />
          <div className="anime-bathhouse" />
          <div className="anime-water" />
          <div className="anime-foreground-mist" />

          {/* 灯笼与灵尘装饰 - 移动端隐藏 */}
          {!isMobile && (
            <>
              <motion.div
                className="anime-lantern anime-lantern-right"
                style={{
                  position: 'absolute',
                  top: isTablet ? '18%' : '16%',
                  right: isTablet ? '8%' : '12%',
                  width: isTablet ? '64px' : '82px',
                  height: isTablet ? '92px' : '118px',
                  zIndex: 1,
                }}
                animate={{
                  y: [0, -16, 0],
                  rotate: [3, 6, 3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <motion.div
                className="anime-lantern anime-lantern-left"
                style={{
                  position: 'absolute',
                  bottom: isTablet ? '23%' : '18%',
                  left: isTablet ? '8%' : '10%',
                  width: isTablet ? '54px' : '70px',
                  height: isTablet ? '78px' : '100px',
                  zIndex: 1,
                }}
                animate={{
                  y: [0, 12, 0],
                  rotate: [-4, -7, -4],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              />
              <div className="anime-spirit-dust" />
            </>
          )}
          
          <Hero />
        </motion.div>
      )}
    </>
  )
}
