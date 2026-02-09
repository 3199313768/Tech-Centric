'use client'

import { useState } from 'react'
import { recommendations } from '@/data/personal'

export function Recommendations() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const types = Array.from(new Set(recommendations.map(rec => rec.type)))
  const typeLabels: Record<string, string> = {
    book: '书籍',
    movie: '电影',
    tool: '工具',
    music: '音乐',
    other: '其他'
  }

  const filteredRecommendations = selectedType
    ? recommendations.filter(rec => rec.type === selectedType)
    : recommendations

  // 渲染评分星星
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          fontSize: '16px',
          color: i < rating ? '#00d9ff' : 'rgba(255, 255, 255, 0.2)',
        }}
      >
        ★
      </span>
    ))
  }

  return (
    <div
      style={{
        padding: '120px 40px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: '#fff',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 'bold',
          marginBottom: '48px',
          fontFamily: 'var(--font-space-mono), monospace',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#00d9ff',
          textShadow: '0 0 20px rgba(0, 217, 255, 0.5)',
        }}
      >
        推荐清单
      </h2>

      {/* 类型筛选 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSelectedType(null)}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: selectedType === null ? 'bold' : 'normal',
            color: selectedType === null ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
            backgroundColor: selectedType === null ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
            border: `1px solid ${selectedType === null ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.2s ease',
          }}
        >
          全部
        </button>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: selectedType === type ? 'bold' : 'normal',
              color: selectedType === type ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: selectedType === type ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              border: `1px solid ${selectedType === type ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
            }}
          >
            {typeLabels[type] || type}
          </button>
        ))}
      </div>

      {/* 推荐列表 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}
      >
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            style={{
              padding: '24px',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              backgroundColor: 'rgba(0, 217, 255, 0.05)',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              cursor: rec.link ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (rec.link) {
                window.open(rec.link, '_blank', 'noopener,noreferrer')
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)'
              if (rec.link) {
                e.currentTarget.style.transform = 'translateY(-4px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#00d9ff',
                      fontFamily: 'var(--font-space-mono), monospace',
                      padding: '4px 10px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {typeLabels[rec.type] || rec.type}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#00d9ff',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    marginBottom: '8px',
                  }}
                >
                  {rec.title}
                </h3>
              </div>
            </div>

            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                marginBottom: '16px',
              }}
            >
              {rec.description}
            </p>

            {/* 评分 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--font-space-mono), monospace',
                }}
              >
                评分：
              </span>
              <div style={{ display: 'flex', gap: '2px' }}>
                {renderStars(rec.rating)}
              </div>
            </div>

            {/* 标签 */}
            {rec.tags && rec.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '12px',
                }}
              >
                {rec.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      padding: '2px 8px',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      borderRadius: '4px',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 链接提示 */}
            {rec.link && (
              <div
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'rgba(0, 217, 255, 0.7)',
                  fontFamily: 'var(--font-space-mono), monospace',
                  textAlign: 'right',
                }}
              >
                点击查看 →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
