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
      
      {/* Hero 区域容器 - 杂志封面风格 */}
      {showHero && (
        <motion.div
          style={{
            position: 'relative',
            backgroundColor: 'var(--color-bg)',
            zIndex: 2,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `
              radial-gradient(circle at 30% 30%, var(--color-cyan-10) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, var(--color-cyan-10) 0%, transparent 50%)
            `,
            overflow: 'hidden',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* 纸张浮动背景元素 - 移动端隐藏 */}
          {!isMobile && (
            <>
              <motion.div
                style={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  width: isTablet ? '200px' : '300px',
                  height: isTablet ? '280px' : '400px',
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-cyan-10)',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px var(--color-card-shadow)',
                  transform: 'rotate(5deg)',
                  overflow: 'hidden',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  zIndex: 1,
                }}
                animate={{
                  y: [0, -20, 0],
                  rotate: [5, 6, 5],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* 装饰线 */}
                <div style={{ position: 'absolute', top: 0, left: '20px', width: '1px', height: '100%', background: 'var(--color-text-secondary)', opacity: 0.2 }} />
                
                {/* 顶部小字 */}
                <div style={{ 
                  fontFamily: 'var(--font-space-mono), monospace', 
                  fontSize: isTablet ? '10px' : '12px', 
                  color: 'var(--color-text-primary)',
                  letterSpacing: '2px',
                  paddingLeft: '10px',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  OXYGEN / PORTFOLIO
                </div>

                {/* 背景大字 O */}
                <div style={{
                  position: 'absolute',
                  bottom: isTablet ? '-30px' : '-50px',
                  right: isTablet ? '-30px' : '-60px',
                  fontSize: isTablet ? '240px' : '380px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: 'var(--color-cyan-10)',
                  lineHeight: 1,
                  zIndex: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}>
                  O
                </div>
                
                {/* 底部分类 */}
                <div style={{
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  fontSize: isTablet ? '14px' : '22px',
                  fontWeight: 'bold',
                  color: 'var(--color-headline)',
                  letterSpacing: '1px',
                  paddingLeft: '10px',
                  position: 'relative',
                  zIndex: 2,
                }}>
                  CREATIVE<br />DEVELOPER
                </div>
              </motion.div>

              {/* 左下角小卡片 */}
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '5%',
                  width: isTablet ? '180px' : '250px',
                  height: isTablet ? '250px' : '350px',
                  background: 'var(--color-card-bg)',
                  border: '1px solid var(--color-cyan-10)',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px var(--color-card-shadow)',
                  transform: 'rotate(-3deg)',
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
                animate={{
                  y: [0, 15, 0],
                  rotate: [-3, -4, -3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-space-mono), monospace',
                  color: 'var(--color-headline)',
                  textTransform: 'uppercase',
                }}>
                  <div style={{ fontSize: isTablet ? '32px' : '48px', fontWeight: 'bold', lineHeight: 1 }}>CODE</div>
                  <div style={{ fontSize: isTablet ? '14px' : '20px', fontStyle: 'italic', color: 'var(--color-cyan)', paddingLeft: '20px', marginBottom: '24px' }}>as craft</div>
                  
                  <div style={{ width: '40px', height: '2px', background: 'var(--color-text-secondary)', marginBottom: '24px', opacity: 0.5 }} />
                  
                  <div style={{ fontSize: isTablet ? '24px' : '36px', fontWeight: 'bold', lineHeight: 1.1, textAlign: 'right' }}>USER<br />FIRST</div>
                </div>
              </motion.div>
            </>
          )}
          
          <Hero />
        </motion.div>
      )}
    </>
  )
}
