'use client'

import { useState } from 'react'
import type { VibeEntry, VibeKind } from '@/lib/vibe/types'
import { saveVibeProject } from '@/lib/vibe/actions'
import { SpiritModalShell } from '@/components/spirit/shell/SpiritModalShell'
import { useToast } from '@/components/spirit/feedback/ToastProvider'

interface AddVibeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: VibeEntry | null
}

function buildVibeForm(initialData?: VibeEntry | null) {
  if (initialData) {
    return {
      name: initialData.name,
      icon: initialData.icon,
      description: initialData.description,
      url: initialData.url,
      kind: initialData.kind,
      body: initialData.body,
      is_public: initialData.isPublic,
      tags: initialData.tags.join(', '),
    }
  }
  return {
    name: '',
    icon: '✨',
    description: '',
    url: '',
    kind: 'project' as VibeKind,
    body: '',
    is_public: false,
    tags: '',
  }
}

export function AddVibeModal({ isOpen, onClose, onSuccess, initialData }: AddVibeModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(() => buildVibeForm(initialData))

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name === 'is_public') {
      setFormData((prev) => ({ ...prev, [name]: value === 'true' }))
    } else if (name === 'kind') {
      setFormData((prev) => ({ ...prev, kind: value as VibeKind }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const isProject = formData.kind === 'project'
  const needsBody = formData.kind === 'note' || formData.kind === 'article'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const tagsArray = formData.tags.split(',').map((s) => s.trim()).filter(Boolean)

    const { error } = await saveVibeProject({
      id: initialData?.id,
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      url: formData.url,
      kind: formData.kind,
      body: formData.body,
      isPublic: formData.is_public,
      tags: tagsArray,
    })

    setIsSubmitting(false)

    if (error) {
      toast(`${initialData ? '修改' : '新增'}手札失败：${error}`, 'error')
    } else {
      toast(initialData ? '手札已更新' : '手札已新增', 'success')
      onSuccess()
      onClose()
    }
  }

  return (
    <SpiritModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '修改手札' : '新增手札'}
      maxWidth={640}
      footer={
        <>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="submit"
            form="add-vibe-form"
            className="sg-btn sg-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : initialData ? '确认修改' : '确认完成'}
          </button>
        </>
      }
    >
      <form id="add-vibe-form" onSubmit={handleSubmit}>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="vibe-kind">类型 *</label>
          <select
            required
            id="vibe-kind"
            className="sg-form-select"
            name="kind"
            value={formData.kind}
            onChange={handleChange}
          >
            <option value="project">实验项目（外链）</option>
            <option value="note">短笔记</option>
            <option value="article">长文</option>
          </select>
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="vibe-name">标题 *</label>
          <input
            required
            id="vibe-name"
            className="sg-form-input"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例: AI思维圆桌"
          />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="vibe-icon">图标 / Emoji *</label>
          <input
            required
            id="vibe-icon"
            className="sg-form-input"
            style={{ width: '100px', textAlign: 'center' }}
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            placeholder="🪑"
          />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="vibe-desc">摘要 *</label>
          <textarea
            required
            id="vibe-desc"
            className="sg-form-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="一句话介绍..."
          />
        </div>

        {isProject ? (
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="vibe-url">访问链接 (URL) *</label>
            <input
              required
              id="vibe-url"
              className="sg-form-input"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        ) : null}

        {needsBody ? (
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="vibe-body">正文（Markdown）</label>
            <textarea
              id="vibe-body"
              className="sg-form-textarea"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="支持 Markdown..."
              rows={8}
            />
          </div>
        ) : null}

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="vibe-tags">标签（逗号分隔）</label>
          <input
            id="vibe-tags"
            className="sg-form-input"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="React, AI, 前端"
          />
        </div>

        {!isProject ? (
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="vibe-public">公开范围</label>
            <select
              id="vibe-public"
              className="sg-form-select"
              name="is_public"
              value={formData.is_public ? 'true' : 'false'}
              onChange={handleChange}
            >
              <option value="false">仅自己可见</option>
              <option value="true">公开（可被 AI 索引）</option>
            </select>
          </div>
        ) : null}
      </form>
    </SpiritModalShell>
  )
}
