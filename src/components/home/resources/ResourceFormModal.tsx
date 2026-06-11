'use client'

import { motion } from 'framer-motion'
import type { ResourceItem } from '@/data/resources/initialResources'
import { RESOURCE_CATEGORY_LABELS } from '@/utils/resourceCategory'

export interface ResourceFormData {
  name: string
  url: string
  description: string
  category: ResourceItem['category']
  tags: string[]
}

interface ResourceFormModalProps {
  isOpen: boolean
  isMobile: boolean
  modalPad: string
  overlayPad: string
  editingId: string | null
  formData: ResourceFormData
  categories: string[]
  isFetchingMeta: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onFormChange: (updater: (prev: ResourceFormData) => ResourceFormData) => void
  onFetchMeta: (url: string) => void
  onAutoFill: () => void
}

export function ResourceFormModal({
  isOpen,
  isMobile,
  modalPad,
  overlayPad,
  editingId,
  formData,
  categories,
  isFetchingMeta,
  onClose,
  onSubmit,
  onFormChange,
  onFetchMeta,
  onAutoFill,
}: ResourceFormModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="sg-resource-modal-shell"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: overlayPad,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="sg-resource-form-panel"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-ai-card-border)',
          borderRadius: isMobile ? '16px 16px 0 0' : '16px',
          padding: modalPad,
          maxWidth: '420px',
          width: '100%',
          maxHeight: isMobile ? '92dvh' : '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <h3 className="sg-resource-form-title">
          {editingId ? '编辑资源' : '添加资源'}
        </h3>
        <form onSubmit={onSubmit}>
          <div className="sg-form-field">
            <label htmlFor="field-name" className="sg-form-label">
              名称 *
            </label>
            <input
              id="field-name"
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange((f) => ({ ...f, name: e.target.value }))}
              placeholder="例如：MDN"
              required
              className="sg-form-input"
            />
          </div>

          <div className="sg-form-field">
            <label htmlFor="field-url" className="sg-form-label">
              URL *
            </label>
            <div className="sg-resource-form-url-row">
              <input
                id="field-url"
                type="url"
                value={formData.url}
                onChange={(e) => onFormChange((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
                required
                className="sg-form-input sg-resource-form-url-input"
              />
              <button
                type="button"
                onClick={() => onFetchMeta(formData.url)}
                disabled={isFetchingMeta || !formData.url}
                className="sg-btn sg-btn--ghost sg-resource-form-meta-btn"
                aria-label="抓取网页元数据"
              >
                抓取
              </button>
              <button
                type="button"
                onClick={onAutoFill}
                disabled={isFetchingMeta || !formData.url}
                className="sg-btn sg-btn--ghost sg-resource-form-ai-btn"
                aria-label="AI 自动填充"
              >
                AI 填充
              </button>
            </div>
          </div>

          <div className="sg-form-field">
            <label htmlFor="field-desc" className="sg-form-label">
              描述（可选）
            </label>
            <textarea
              id="field-desc"
              value={formData.description}
              onChange={(e) => onFormChange((f) => ({ ...f, description: e.target.value }))}
              placeholder="简短描述"
              rows={3}
              className="sg-form-input sg-form-textarea"
            />
          </div>

          <div className="sg-form-field">
            <label htmlFor="field-category" className="sg-form-label">
              分类
            </label>
            <select
              id="field-category"
              value={formData.category}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'new') {
                  const newCat = window.prompt('请输入新分类名称')
                  if (newCat?.trim()) {
                    onFormChange((f) => ({ ...f, category: newCat.trim() }))
                  }
                } else {
                  onFormChange((f) => ({ ...f, category: val }))
                }
              }}
              className="sg-form-input"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {RESOURCE_CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
              {!categories.includes(formData.category) && formData.category !== 'other' && formData.category ? (
                <option value={formData.category}>{formData.category}</option>
              ) : null}
              <option value="new">+ 新增分类...</option>
            </select>
          </div>

          <div className="sg-form-field">
            <span className="sg-form-label">标签（可选，逗号分隔）</span>
            <div className="sg-resource-tag-editor">
              {formData.tags.map((tag) => (
                <span key={tag} className="sg-resource-tag-chip">
                  {tag}
                  <button
                    type="button"
                    onClick={() => onFormChange((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                    className="sg-resource-tag-chip__remove"
                    aria-label={`移除标签 ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={formData.tags.length === 0 ? '输入标签按回车...' : ''}
                className="sg-resource-tag-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = e.currentTarget.value.trim()
                    if (val && !formData.tags.includes(val)) {
                      onFormChange((f) => ({ ...f, tags: [...f.tags, val] }))
                      e.currentTarget.value = ''
                    }
                  } else if (e.key === 'Backspace' && !e.currentTarget.value && formData.tags.length > 0) {
                    onFormChange((f) => ({ ...f, tags: f.tags.slice(0, -1) }))
                  }
                }}
              />
            </div>
          </div>

          <div className="sg-modal-actions">
            <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="sg-btn sg-btn--primary">
              {editingId ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
