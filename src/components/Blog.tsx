'use client'

import { useState } from 'react'
import { blogPosts } from '@/data/personal'

export function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(blogPosts.map(post => post.category)))
  const filteredPosts = selectedCategory
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
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
        博客
      </h2>

      {/* 分类筛选 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: selectedCategory === null ? 'bold' : 'normal',
            color: selectedCategory === null ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
            backgroundColor: selectedCategory === null ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
            border: `1px solid ${selectedCategory === null ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.2s ease',
          }}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: selectedCategory === category ? 'bold' : 'normal',
              color: selectedCategory === category ? '#00d9ff' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: selectedCategory === category ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
              border: `1px solid ${selectedCategory === category ? 'rgba(0, 217, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      <div
        style={{
          display: 'grid',
          gap: '24px',
        }}
      >
        {filteredPosts.map((post, index) => (
          <article
            key={post.id}
            style={{
              padding: '24px',
              border: '1px solid rgba(0, 217, 255, 0.3)',
              backgroundColor: 'rgba(0, 217, 255, 0.05)',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (post.link && post.link !== '#') {
                window.open(post.link, '_blank', 'noopener,noreferrer')
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)'
              e.currentTarget.style.transform = 'translateX(8px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateX(0)'
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
                  {post.title}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      padding: '4px 10px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {post.category}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {formatDate(post.date)}
                  </span>
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.75)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                marginBottom: '12px',
              }}
            >
              {post.excerpt}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '12px',
                }}
              >
                {post.tags.map((tag, idx) => (
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
          </article>
        ))}
      </div>
    </div>
  )
}
