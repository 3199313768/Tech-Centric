'use client'

import { personalInfo } from '@/data/personal'
import { Typewriter } from './Typewriter'
import { motion } from 'framer-motion'
import { useBreakpoint } from '@/utils/useBreakpoint'

export function Hero() {
  const { isMobile, isTablet } = useBreakpoint()

  const handleCTAClick = (action: string) => {
    if (action.startsWith('mailto:')) {
      window.location.href = action
    } else if (action.startsWith('http')) {
      window.open(action, '_blank', 'noopener,noreferrer')
    } else {
      const element = document.querySelector(action)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const currentDate = new Date().toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })

  return (
    <motion.div
      className="relative pointer-events-auto"
      style={{
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        zIndex: 20,
        width: 'min(760px, calc(100vw - 32px))',
        padding: isMobile ? '28px 22px' : isTablet ? '34px 34px' : '42px 46px',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginTop: isMobile ? '72px' : '92px',
        marginRight: isMobile ? '0' : 'min(28vw, 420px)',
        background: 'linear-gradient(135deg, rgba(255, 249, 239, 0.78), rgba(255, 231, 194, 0.48))',
        border: '1px solid rgba(180, 58, 36, 0.16)',
        borderRadius: isMobile ? '22px' : '30px',
        backdropFilter: 'blur(18px) saturate(1.08)',
        boxShadow: '0 28px 80px rgba(87, 53, 38, 0.18), inset 0 0 0 1px rgba(255, 255, 255, 0.34)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 日期标签 - 杂志风格 */}
      <motion.div
        className="magazine-date-label"
        style={{ marginBottom: isMobile ? '16px' : '24px', alignSelf: 'flex-start' }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {currentDate}
      </motion.div>

      {/* 杂志封面大标题 */}
      <motion.h1
        className="magazine-headline"
        data-text={personalInfo.name}
        style={{
          fontSize: 'clamp(42px, 7vw, 88px)',
          fontWeight: 'bold',
          lineHeight: '1.1',
          textShadow: 'var(--color-headline-shadow)',
          position: 'relative',
          display: 'block',
          marginBottom: '16px',
          color: 'var(--color-text-hero)',
          letterSpacing: '-0.04em',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, type: 'spring', stiffness: 100 }}
      >
        <Typewriter text={personalInfo.name} speed={100} delay={600} />
      </motion.h1>
      
      {/* 副标题 */}
      <motion.p
        className="magazine-subheadline"
        style={{
          fontSize: 'clamp(18px, 3vw, 28px)',
          fontWeight: '300',
          lineHeight: '1.6',
          color: 'var(--color-text-hero-sub)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          marginBottom: isMobile ? '24px' : '32px',
          letterSpacing: '2px',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Typewriter text={personalInfo.title} speed={50} delay={2000} />
      </motion.p>

      {/* 个人简介 - 杂志式引用块 */}
      <motion.div
        style={{
          marginBottom: isMobile ? '24px' : '40px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
      >
        {personalInfo.bio.map((line, index) => (
          <motion.p
            key={index}
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: '1.8',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              marginBottom: '12px',
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.7 + index * 0.2, duration: 0.5 }}
          >
            {line}
          </motion.p>
        ))}
      </motion.div>

      {/* 技能标签 - 飘落效果 */}
      <motion.div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? '8px' : '12px',
          marginBottom: isMobile ? '24px' : '40px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.6 }}
      >
        {personalInfo.skills.map((skill, index) => (
          <motion.span
            key={index}
            style={{
              display: 'inline-block',
              padding: isMobile ? '4px 10px' : '6px 16px',
              fontSize: isMobile ? '11px' : '12px',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              fontWeight: 700,
              color: 'var(--color-cyan)',
              border: '1px solid var(--color-cyan-40)',
              backgroundColor: 'var(--color-cyan-10)',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 8px 20px rgba(247, 178, 91, 0.18)',
              cursor: 'default',
            }}
            initial={{ opacity: 0, y: -50, rotate: -10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
              delay: 3.7 + index * 0.1,
              duration: 0.6,
              type: 'spring',
              stiffness: 150
            }}
            whileHover={{
              scale: 1.1,
              rotate: index % 2 === 0 ? 3 : -3,
              borderColor: 'var(--color-cyan)',
              backgroundColor: 'var(--color-cyan-15)',
              boxShadow: '0 12px 28px rgba(247, 178, 91, 0.3)',
              transition: { duration: 0.2 }
            }}
          >
            {skill}
          </motion.span>
        ))}
      </motion.div>

      {/* CTA 按钮 */}
      <motion.div
        style={{
          display: 'flex',
          gap: isMobile ? '10px' : '16px',
          flexWrap: 'wrap',
          marginBottom: isMobile ? '24px' : '40px',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.5, duration: 0.6 }}
      >
        <motion.button
          onClick={() => handleCTAClick(personalInfo.cta.primary.action)}
          style={{
            padding: isMobile ? '10px 20px' : '14px 32px',
            fontSize: isMobile ? '13px' : '15px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: 'bold',
            color: 'var(--color-bg)',
            background: 'linear-gradient(135deg, #b43a24 0%, #c7812f 100%)',
            border: '2px solid var(--color-cyan)',
            borderRadius: '999px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 14px 34px rgba(180, 58, 36, 0.28)',
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 18px 42px rgba(180, 58, 36, 0.36)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          {personalInfo.cta.primary.text}
        </motion.button>
        {personalInfo.cta.secondary && (
          <motion.button
            onClick={() => handleCTAClick(personalInfo.cta.secondary!.action)}
            style={{
              padding: isMobile ? '10px 20px' : '14px 32px',
              fontSize: isMobile ? '13px' : '15px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: 'bold',
              color: 'var(--color-cyan)',
              backgroundColor: 'rgba(255, 249, 239, 0.42)',
              border: '2px solid var(--color-cyan)',
              borderRadius: '999px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              boxShadow: '0 12px 28px rgba(247, 178, 91, 0.18)',
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: 'var(--color-cyan-15)',
              boxShadow: '0 16px 36px rgba(247, 178, 91, 0.3)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {personalInfo.cta.secondary.text}
          </motion.button>
        )}
      </motion.div>

      {/* 社交媒体链接 */}
      <motion.div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5, duration: 0.6 }}
      >
        {personalInfo.socialLinks.github && (
          <motion.a
            href={personalInfo.socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '24px',
              color: 'var(--color-text-social)',
              textDecoration: 'none',
            }}
            whileHover={{
              scale: 1.2,
              color: 'var(--color-cyan)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </motion.a>
        )}
        {personalInfo.socialLinks.linkedin && (
          <motion.a
            href={personalInfo.socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '24px',
              color: 'var(--color-text-social)',
              textDecoration: 'none',
            }}
            whileHover={{
              scale: 1.2,
              color: 'var(--color-cyan)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </motion.a>
        )}
        {personalInfo.socialLinks.email && (
          <motion.a
            href={personalInfo.socialLinks.email}
            style={{
              fontSize: '24px',
              color: 'var(--color-text-social)',
              textDecoration: 'none',
            }}
            whileHover={{
              scale: 1.2,
              color: 'var(--color-cyan)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/>
            </svg>
          </motion.a>
        )}
        {personalInfo.socialLinks.twitter && (
          <motion.a
            href={personalInfo.socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '24px',
              color: 'var(--color-text-social)',
              textDecoration: 'none',
            }}
            whileHover={{
              scale: 1.2,
              color: 'var(--color-cyan)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
            </svg>
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  )
}
