'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { getInitialResources, type ResourceItem } from '@/data/initialResources'

const STORAGE_KEY = 'tech-centric-resources'

export type { ResourceItem }

const CATEGORY_LABELS: Record<ResourceItem['category'], string> = {
  learning: '学习',
  ai: 'AI',
  other: '其他',
}

const CATEGORY_ICONS: Record<ResourceItem['category'], string> = {
  learning: '📚',
  ai: '🤖',
  other: '🔗',
}

function loadFromStorage(): ResourceItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const initial = getInitialResources()
    if (!raw || raw === '[]') {
      saveToStorage(initial)
      return initial
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveToStorage(initial)
      return initial
    }
    return parsed
  } catch {
    const initial = getInitialResources()
    saveToStorage(initial)
    return initial
  }
}

function saveToStorage(items: ResourceItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

interface FormData {
  name: string
  url: string
  description: string
  category: ResourceItem['category']
}

const emptyForm: FormData = {
  name: '',
  url: '',
  description: '',
  category: 'other',
}

export function ResourceLinks() {
  const [items, setItems] = useState<ResourceItem[]>([])
  const [filter, setFilter] = useState<ResourceItem['category'] | 'all'>('all')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    const data = loadFromStorage()
    queueMicrotask(() => setItems(data))
  }, [])

  const persist = useCallback((next: ResourceItem[]) => {
    setItems(next)
    saveToStorage(next)
  }, [])

  const filteredItems =
    filter === 'all' ? items : items.filter((i) => i.category === filter)

  const openForm = (item?: ResourceItem) => {
    if (item) {
      setEditingId(item.id)
      setFormData({
        name: item.name,
        url: item.url,
        description: item.description ?? '',
        category: item.category,
      })
    } else {
      setEditingId(null)
      setFormData(emptyForm)
    }
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const url = formData.url.trim()
    if (!name || !url) return

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    if (editingId) {
      persist(
        items.map((i) =>
          i.id === editingId
            ? {
              ...i,
              name,
              url: normalizedUrl,
              description: formData.description.trim() || undefined,
              category: formData.category,
            }
            : i
        )
      )
    } else {
      persist([
        ...items,
        {
          id: generateId(),
          name,
          url: normalizedUrl,
          description: formData.description.trim() || undefined,
          category: formData.category,
          createdAt: Date.now(),
        },
      ])
    }
    closeForm()
  }

  const handleDelete = (id: string) => {
    persist(items.filter((i) => i.id !== id))
    setDeleteConfirmId(null)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
    },
  }

  return (
    <div
      style={{
        padding: '120px 24px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-inter), sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '40px', textAlign: 'center' }}
      >
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          学习网站、AI 相关网站等常用链接
        </p>
      </motion.div>

      {/* 分类筛选 + 添加按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        {(['all', 'learning', 'ai', 'other'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              fontWeight: filter === key ? 'bold' : 'normal',
              color: filter === key ? 'var(--color-cyan)' : 'var(--color-text-secondary)',
              backgroundColor: filter === key ? 'var(--color-cyan-10)' : 'var(--color-ai-tag-bg)',
              border: `1px solid ${filter === key ? 'var(--color-cyan-50)' : 'var(--color-ai-tag-border)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {key === 'all' ? '全部' : CATEGORY_LABELS[key]}
          </button>
        ))}
        <button
          onClick={() => openForm()}
          style={{
            padding: '8px 20px',
            fontSize: '13px',
            fontFamily: 'var(--font-space-mono), monospace',
            fontWeight: 600,
            color: 'var(--color-cyan)',
            backgroundColor: 'var(--color-cyan-10)',
            border: '1px solid var(--color-cyan-50)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginLeft: '8px',
          }}
        >
          + 添加
        </button>
        <button
          onClick={() => {
            const initial = getInitialResources()
            persist(initial)
          }}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontFamily: 'var(--font-space-mono), monospace',
            color: 'var(--color-text-muted)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-ai-tag-border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          恢复默认
        </button>
      </motion.div>

      {/* 空状态 */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            color: 'var(--color-text-muted)',
          }}
        >
          <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
            {items.length === 0
              ? '暂无资源，点击上方「添加」添加第一个'
              : `当前分类暂无资源`}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => openForm()}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                color: 'var(--color-cyan)',
                backgroundColor: 'var(--color-cyan-10)',
                border: '1px solid var(--color-cyan-50)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-space-mono), monospace',
              }}
            >
              添加第一个
            </button>
          )}
        </motion.div>
      )}

      {/* 卡片列表 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            variants={cardVariants}
            onHoverStart={() => setHoveredId(item.id)}
            onHoverEnd={() => setHoveredId(null)}
            style={{
              position: 'relative',
              background: 'var(--color-ai-card-bg)',
              border: `1px solid ${hoveredId === item.id ? 'var(--color-cyan-50)' : 'var(--color-ai-card-border)'}`,
              borderRadius: '16px',
              padding: '32px 24px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: hoveredId === item.id ? 'translateY(-8px)' : 'translateY(0)',
              boxShadow:
                hoveredId === item.id
                  ? `0 15px 30px var(--color-ai-shadow-hover)`
                  : `0 5px 15px var(--color-ai-shadow)`,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--color-cyan), transparent)',
                opacity: hoveredId === item.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '20px',
                height: '20px',
                borderTop: `2px solid ${hoveredId === item.id ? 'var(--color-cyan)' : 'transparent'}`,
                borderRight: `2px solid ${hoveredId === item.id ? 'var(--color-cyan)' : 'transparent'}`,
                transition: 'all 0.3s ease',
              }}
            />

            {/* 操作按钮 */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                opacity: hoveredId === item.id ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openForm(item)
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: 'var(--color-cyan)',
                  background: 'var(--color-cyan-10)',
                  border: '1px solid var(--color-cyan-30)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                编辑
              </button>
              {deleteConfirmId === item.id ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: 'var(--color-red, #ef4444)',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    确认
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirmId(null)
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                      background: 'transparent',
                      border: '1px solid var(--color-ai-tag-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirmId(item.id)
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    background: 'transparent',
                    border: '1px solid var(--color-ai-tag-border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  删除
                </button>
              )}
            </div>

            <div
              onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              style={{ paddingRight: '80px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    background: 'var(--color-ai-card-icon-bg)',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    border: '1px solid var(--color-ai-card-icon-border)',
                  }}
                >
                  {CATEGORY_ICONS[item.category]}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 8px',
                    background: 'var(--color-cyan-10)',
                    color: 'var(--color-cyan)',
                    borderRadius: '20px',
                    fontFamily: 'var(--font-space-mono), monospace',
                    letterSpacing: '0.5px',
                    border: '1px solid var(--color-cyan-20)',
                  }}
                >
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--color-text-primary)',
                }}
              >
                {item.name}
              </h3>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  minHeight: item.description ? 'auto' : '24px',
                }}
              >
                {item.description || item.url}
              </p>

              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-cyan)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                访问 →
              </span>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '-50%',
                left: '-20%',
                width: '140%',
                height: '100%',
                background:
                  'radial-gradient(ellipse at bottom, var(--color-cyan-15) 0%, transparent 70%)',
                opacity: hoveredId === item.id ? 1 : 0,
                transition: 'opacity 0.5s ease',
                pointerEvents: 'none',
                zIndex: -1,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* 表单弹窗 */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={closeForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-ai-card-border)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '24px',
                color: 'var(--color-text-primary)',
              }}
            >
              {editingId ? '编辑资源' : '添加资源'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="例如：MDN"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    background: 'var(--color-ai-tag-bg)',
                    border: '1px solid var(--color-ai-tag-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    background: 'var(--color-ai-tag-bg)',
                    border: '1px solid var(--color-ai-tag-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  描述（可选）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  placeholder="简短描述"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    background: 'var(--color-ai-tag-bg)',
                    border: '1px solid var(--color-ai-tag-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      category: e.target.value as ResourceItem['category'],
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    background: 'var(--color-ai-tag-bg)',
                    border: '1px solid var(--color-ai-tag-border)',
                    borderRadius: '8px',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                >
                  <option value="learning">学习</option>
                  <option value="ai">AI</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    background: 'transparent',
                    border: '1px solid var(--color-ai-tag-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    color: 'var(--color-bg)',
                    background: 'var(--color-cyan)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {editingId ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
