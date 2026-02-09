'use client'

import { useState } from 'react'
import { lifeLogs } from '@/data/personal'

export function LifeLog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 获取所有标签
  const allTags = Array.from(new Set(lifeLogs.flatMap(log => log.tags)))
  
  // 筛选日志
  const filteredLogs = selectedTag
    ? lifeLogs.filter(log => log.tags.includes(selectedTag))
    : lifeLogs

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    })
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
        日常随笔
      </h2>

      {/* 标签筛选 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSelectedTag(null)}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: selectedTag === null ? 'bold' : 'normal',
            color: selectedTag === null ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
            backgroundColor: selectedTag === null ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
            border: `1px solid ${selectedTag === null ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.2s ease',
          }}
        >
          全部
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: selectedTag === tag ? 'bold' : 'normal',
              color: selectedTag === tag ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: selectedTag === tag ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              border: `1px solid ${selectedTag === tag ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 日志列表 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {filteredLogs.map((log) => {
          const isExpanded = expandedId === log.id
          const shouldTruncate = log.content.length > 150 && !isExpanded
          const displayContent = shouldTruncate 
            ? log.content.substring(0, 150) + '...' 
            : log.content

          return (
            <article
              key={log.id}
              style={{
                padding: '24px',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                backgroundColor: 'rgba(0, 217, 255, 0.05)',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (log.content.length > 150) {
                  setExpandedId(isExpanded ? null : log.id)
                }
              }}
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
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#00d9ff',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      marginBottom: '8px',
                    }}
                  >
                    {log.title}
                  </h3>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {formatDate(log.date)}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  marginBottom: '16px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {displayContent}
              </p>

              {/* 标签 */}
              {log.tags && log.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '12px',
                  }}
                >
                  {log.tags.map((tag, idx) => (
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

              {/* 展开/收起提示 */}
              {log.content.length > 150 && (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    textAlign: 'right',
                  }}
                >
                  {isExpanded ? '点击收起' : '点击展开全文'}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
