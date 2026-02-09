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
            backgroundColor: 'rgba(0, 217, 255, 0.3)',
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
                  backgroundColor: '#00d9ff',
                  border: '3px solid #0a0a0a',
                  boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
                }}
              />

              {/* 年度卡片 */}
              <div
                style={{
                  padding: '24px',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  backgroundColor: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isExpanded ? null : review.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
                  e.currentTarget.style.boxShadow = 'none'
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
                        color: '#00d9ff',
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
                        color: 'rgba(255, 255, 255, 0.9)',
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
                    color: 'rgba(255, 255, 255, 0.75)',
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
                      borderTop: '1px solid rgba(0, 217, 255, 0.2)',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#00d9ff',
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
                            color: 'rgba(255, 255, 255, 0.75)',
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
                              color: '#00d9ff',
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
                    color: 'rgba(255, 255, 255, 0.5)',
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
