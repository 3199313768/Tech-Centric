'use client'

import { Hero } from './Hero'
import { motion } from 'framer-motion'

interface PhysicsWorldProps {
  className?: string
  showHero?: boolean
}

export function PhysicsWorld({ className, showHero = true }: PhysicsWorldProps) {
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
          {/* 纸张浮动背景元素 */}
          <motion.div
            style={{
              position: 'absolute',
              top: '10%',
              right: '10%',
              width: '300px',
              height: '400px',
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-cyan-10)',
              borderRadius: '8px',
              boxShadow: '0 20px 60px var(--color-card-shadow)',
              transform: 'rotate(5deg)',
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
          />
          <motion.div
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '5%',
              width: '250px',
              height: '350px',
              background: 'var(--color-card-bg)',
              border: '1px solid var(--color-cyan-10)',
              borderRadius: '8px',
              boxShadow: '0 20px 60px var(--color-card-shadow)',
              transform: 'rotate(-3deg)',
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
          />
          
          <Hero />
        </motion.div>
      )}
    </>
  )
}
