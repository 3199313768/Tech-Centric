'use client'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'home', label: '首页' },
  { id: 'blog', label: '博客' },
  { id: 'lifelog', label: '随笔' },
  { id: 'yearlyreview', label: '年度回顾' },
  { id: 'recommendations', label: '推荐' },
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
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
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
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              color: activeTab === tab.id ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: activeTab === tab.id ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              border: `1px solid ${activeTab === tab.id ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 0 10px rgba(0, 217, 255, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#00d9ff'
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
