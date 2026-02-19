'use client'

import { ThemeToggle } from './ThemeToggle'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'home', label: '首页' },
  { id: 'yearlyreview', label: '年度回顾' },
  { id: 'travel', label: '旅行' },
  { id: 'contact', label: '联系' }
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        backgroundColor: 'var(--color-nav-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-nav-border)',
        padding: '12px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
        }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              color: activeTab === tab.id ? 'var(--color-cyan)' : 'var(--color-nav-text)',
              backgroundColor: activeTab === tab.id ? 'var(--color-cyan-10)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'var(--color-cyan-50)' : 'var(--color-btn-inactive-border)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 0 10px var(--color-cyan-glow)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--color-cyan)'
                e.currentTarget.style.borderColor = 'var(--color-cyan-30)'
                e.currentTarget.style.backgroundColor = 'var(--color-cyan-10)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'var(--color-nav-text)'
                e.currentTarget.style.borderColor = 'var(--color-btn-inactive-border)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
        {/* 主题切换按钮 */}
        <div style={{ marginLeft: '16px' }}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
