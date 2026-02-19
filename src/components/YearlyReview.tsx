'use client'

import { useState } from 'react'
import { yearlyReviews } from '@/data/personal'

export function YearlyReview() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div
      style={{
        padding: '120px 40px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        color: 'var(--color-text-primary)',
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
          color: 'var(--color-headline)',
          textShadow: 'var(--color-headline-shadow)',
        }}
      >
        年度回顾
      </h2>

      <div
        style={{
          position: 'relative',
          paddingLeft: '32px',
        }}
      >
        {/* 时间轴线 */}
        <div
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: 'var(--color-cyan-30)',
          }}
        />

        {yearlyReviews.map((review, index) => {
          const isExpanded = expandedId === review.id

          return (
            <div
              key={review.id}
              style={{
                position: 'relative',
                marginBottom: '48px',
                paddingLeft: '48px',
              }}
            >
              {/* 时间轴节点 */}
              <div
                style={{
                  position: 'absolute',
                  left: '-8px',
                  top: '8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-cyan)',
                  border: '3px solid var(--color-timeline-dot-border)',
                  boxShadow: '0 0 10px var(--color-cyan-glow)',
                }}
              />

              {/* 年度卡片 */}
              <div
                style={{
                  padding: '24px',
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px var(--color-card-shadow)',
                }}
                onClick={() => setExpandedId(isExpanded ? null : review.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-cyan-50)'
                  e.currentTarget.style.boxShadow = '0 0 20px var(--color-cyan-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-card-border)'
                  e.currentTarget.style.boxShadow = '0 4px 20px var(--color-card-shadow)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: 'var(--color-cyan)',
                        fontFamily: 'var(--font-space-mono), monospace',
                        marginBottom: '8px',
                      }}
                    >
                      {review.year}
                    </h3>
                    <h4
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        marginBottom: '8px',
                      }}
                    >
                      {review.title}
                    </h4>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    marginBottom: '16px',
                  }}
                >
                  {review.description}
                </p>

                {/* 展开的重要事件 */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'var(--color-cyan)',
                        fontFamily: 'var(--font-space-mono), monospace',
                        marginBottom: '12px',
                      }}
                    >
                      重要时刻
                    </h4>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        marginBottom: '16px',
                      }}
                    >
                      {review.highlights.map((highlight, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: '14px',
                            lineHeight: '1.8',
                            color: 'var(--color-text-secondary)',
                            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                            marginBottom: '8px',
                            paddingLeft: '20px',
                            position: 'relative',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: '0',
                              color: 'var(--color-cyan)',
                            }}
                          >
                            ▸
                          </span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 展开/收起提示 */}
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    textAlign: 'right',
                  }}
                >
                  {isExpanded ? '点击收起' : '点击查看详情'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
