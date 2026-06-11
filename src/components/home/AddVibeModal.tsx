'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SpiritModalShell } from '@/components/spirit/SpiritModalShell'
import { useToast } from '@/components/spirit/ToastProvider'

interface VibeProject {
  id: string
  name: string
  description: string
  url: string
  icon: string
}

interface AddVibeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: VibeProject | null
}

function buildVibeForm(initialData?: VibeProject | null) {
  if (initialData) {
    return {
      name: initialData.name,
      icon: initialData.icon,
      description: initialData.description,
      url: initialData.url,
    }
  }
  return {
    name: '',
    icon: '✨',
    description: '',
    url: '',
  }
}

export function AddVibeModal({ isOpen, onClose, onSuccess, initialData }: AddVibeModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(() => buildVibeForm(initialData))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    const projectData = {
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      url: formData.url,
    }

    let error

    if (initialData) {
      const response = await supabase.from('vibe_coding').update(projectData).eq('id', initialData.id)
      error = response.error
    } else {
      const response = await supabase.from('vibe_coding').insert([{ id: crypto.randomUUID(), ...projectData }])
      error = response.error
    }

    setIsSubmitting(false)

    if (error) {
      console.error('Error saving vibe project:', error)
      toast((initialData ? '修改' : '新增') + '项目失败：' + error.message, 'error')
    } else {
      toast(initialData ? '项目已更新' : '项目已新增', 'success')
      onSuccess()
      onClose()
    }
  }

  return (
    <SpiritModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? '修改 Vibe Coding 项目' : '新增 Vibe Coding 项目'}
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
          <label className="sg-form-label" htmlFor="vibe-name">项目名称 *</label>
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
          <label className="sg-form-label" htmlFor="vibe-desc">一句话描述 *</label>
          <textarea
            required
            id="vibe-desc"
            className="sg-form-textarea"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="让思想，在分歧中变得完整..."
          />
        </div>

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
      </form>
    </SpiritModalShell>
  )
}
