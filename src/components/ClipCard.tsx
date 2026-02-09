'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ClipCardProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  rotation?: number
  delay?: number
  onClick?: () => void
}

export function ClipCard({ 
  children, 
  className = '', 
  style = {}, 
  rotation = 0,
  delay = 0,
  onClick 
}: ClipCardProps) {
  // 使用 useState 和 useEffect 确保随机值只在客户端生成，避免 hydration 错误
  // 初始值设为 0，确保 SSR 和客户端首次渲染一致
  const [randomRotation, setRandomRotation] = useState(0)
  
  useEffect(() => {
    // 只在客户端生成随机旋转角度（如果未传入 rotation 或 rotation 为 0）
    if (typeof window !== 'undefined') {
      if (rotation !== undefined && rotation !== 0) {
        setRandomRotation(rotation)
      } else {
        setRandomRotation(Math.random() * 6 - 3) // -3 到 3 度
      }
    }
  }, [rotation])
  
  return (
    <motion.div
      className={`clip-card ${className}`}
      suppressHydrationWarning
      style={{
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '4px',
        boxShadow: `
          0 4px 15px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(0, 0, 0, 0.05),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: randomRotation - 10 }}
      whileInView={{ opacity: 1, scale: 1, rotate: randomRotation }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: 'spring',
        stiffness: 100
      }}
      whileHover={{
        rotate: randomRotation + 2,
        scale: 1.05,
        zIndex: 10,
        boxShadow: `
          0 8px 25px rgba(0, 0, 0, 0.3),
          0 0 0 1px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
    >
      {/* 撕边效果 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 L100,0 L100,100 L0,100 Z' fill='none' stroke='rgba(0,0,0,0.1)' stroke-width='0.5' stroke-dasharray='2,2'/%3E%3C/svg%3E"),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)
          `,
          pointerEvents: 'none',
          borderRadius: '4px',
          opacity: 0.3,
        }}
      />
      {children}
    </motion.div>
  )
}
