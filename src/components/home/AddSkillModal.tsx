'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SpiritModalShell } from '@/components/spirit/SpiritModalShell'
import { useToast } from '@/components/spirit/ToastProvider'

interface AgentSkill {
  id: string
  name: string
  icon: string
  description: string
  tags: string[]
  platform?: string
  link?: string
}

interface AddSkillModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: AgentSkill | null
}

function buildSkillForm(initialData?: AgentSkill | null) {
  if (initialData) {
    return {
      name: initialData.name,
      icon: initialData.icon,
      description: initialData.description,
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      platform: initialData.platform || '',
      link: initialData.link || '',
    }
  }
  return {
    name: '',
    icon: '💡',
    description: '',
    tags: '',
    platform: '',
    link: '',
  }
}

export function AddSkillModal({ isOpen, onClose, onSuccess, initialData }: AddSkillModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(() => buildSkillForm(initialData))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const tagsArray = formData.tags.split(',').map(s => s.trim()).filter(Boolean)

    const skillData = {
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      tags: tagsArray,
      platform: formData.platform || null,
      link: formData.link || null,
    }

    let error

    if (initialData) {
      const response = await supabase.from('ai_skills').update(skillData).eq('id', initialData.id)
      error = response.error
    } else {
      const response = await supabase.from('ai_skills').insert([{ id: crypto.randomUUID(), ...skillData }])
      error = response.error
    }

    setIsSubmitting(false)

    if (error) {
      console.error('Error saving skill:', error)
      toast((initialData ? '修改' : '新增') + '技能失败：' + error.message, 'error')
    } else {
      toast(initialData ? '技能已更新' : '技能已新增', 'success')
      onSuccess()
      onClose()
    }
  }

  return (
    <SpiritModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '修改 AI 技能' : '新增 AI 技能'}
      footer={
        <>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="submit"
            form="add-skill-form"
            className="sg-btn sg-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : initialData ? '确认修改' : '确认新增'}
          </button>
        </>
      }
    >
      <form id="add-skill-form" onSubmit={handleSubmit}>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="skill-name">技能名称 *</label>
          <input
            required
            id="skill-name"
            className="sg-form-input"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例: 自动提交代码 (auto-commit)"
          />
        </div>

        <div className="sg-modal-grid-icon">
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="skill-icon">图标 *</label>
            <input
              required
              id="skill-icon"
              className="sg-form-input"
              style={{ textAlign: 'center' }}
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Emoji"
            />
          </div>
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="skill-platform">平台 (选填)</label>
            <input
              id="skill-platform"
              className="sg-form-input"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              placeholder="例: Python、Shell"
            />
          </div>
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="skill-desc">描述 *</label>
          <textarea
            required
            id="skill-desc"
            className="sg-form-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="关于这个技能的简单描述"
          />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="skill-tags">标签 (用逗号分隔)</label>
          <input
            id="skill-tags"
            className="sg-form-input"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Git, Python, AI"
          />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="skill-link">项目仓库/演示链接 (选填)</label>
          <input
            id="skill-link"
            className="sg-form-input"
            name="link"
            type="url"
            value={formData.link}
            onChange={handleChange}
            placeholder="https://github.com/..."
          />
        </div>
      </form>
    </SpiritModalShell>
  )
}
