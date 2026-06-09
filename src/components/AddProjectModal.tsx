'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProjectType } from '@/data/projects'
import { SpiritModalShell } from '@/components/spirit/SpiritModalShell'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'React' as ProjectType,
    description: '',
    detailed_description: '',
    image: '',
    demo_url: '',
    github_url: '',
    technologies: '',
    highlights: '',
    status: 'completed' as 'completed' | 'in-progress' | 'archived',
    start_date: '',
    end_date: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const technologiesArray = formData.technologies.split(',').map(s => s.trim()).filter(Boolean)
    const highlightsArray = formData.highlights.split(',').map(s => s.trim()).filter(Boolean)

    const projectData = {
      id: crypto.randomUUID(),
      title: formData.title,
      type: formData.type,
      description: formData.description,
      detailed_description: formData.detailed_description || null,
      image: formData.image || null,
      demo_url: formData.demo_url || null,
      github_url: formData.github_url || null,
      technologies: technologiesArray,
      highlights: highlightsArray,
      status: formData.status,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    const { error } = await supabase.from('projects').insert([projectData])
    setIsSubmitting(false)

    if (error) {
      console.error('Error inserting project:', error)
      alert('新增项目失败：' + error.message)
    } else {
      onSuccess()
      onClose()
      setFormData({
        title: '',
        type: 'React',
        description: '',
        detailed_description: '',
        image: '',
        demo_url: '',
        github_url: '',
        technologies: '',
        highlights: '',
        status: 'completed',
        start_date: '',
        end_date: '',
      })
    }
  }

  return (
    <SpiritModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="新增项目"
      maxWidth={600}
      footer={
        <>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="submit"
            form="add-project-form"
            className="sg-btn sg-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '确认新增'}
          </button>
        </>
      }
    >
      <form id="add-project-form" onSubmit={handleSubmit}>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="p-title">项目名称 *</label>
          <input required id="p-title" className="sg-form-input" name="title" value={formData.title} onChange={handleChange} placeholder="输入项目名称" />
        </div>

        <div className="sg-modal-grid-2">
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="p-type">类型 *</label>
            <select required id="p-type" className="sg-form-select" name="type" value={formData.type} onChange={handleChange}>
              <option value="React">React</option>
              <option value="Vue">Vue</option>
              <option value="Node">Node</option>
              <option value="AI">AI</option>
              <option value="Mobile">Mobile</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="p-status">状态 *</label>
            <select required id="p-status" className="sg-form-select" name="status" value={formData.status} onChange={handleChange}>
              <option value="completed">已完成 (Completed)</option>
              <option value="in-progress">进行中 (In Progress)</option>
              <option value="archived">已归档 (Archived)</option>
            </select>
          </div>
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="p-desc">简短描述 *</label>
          <textarea required id="p-desc" className="sg-form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="项目的一句话或简短描述" />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="p-detail">详细描述</label>
          <textarea id="p-detail" className="sg-form-textarea" name="detailed_description" value={formData.detailed_description} onChange={handleChange} placeholder="项目的详细说明" />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="p-image">封面图片 URL</label>
          <input id="p-image" className="sg-form-input" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className="sg-modal-grid-2">
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="p-demo">演示链接 (Demo URL)</label>
            <input id="p-demo" className="sg-form-input" name="demo_url" value={formData.demo_url} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="p-github">GitHub 链接</label>
            <input id="p-github" className="sg-form-input" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://..." />
          </div>
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="p-tech">技术栈 (用逗号分隔)</label>
          <input required id="p-tech" className="sg-form-input" name="technologies" value={formData.technologies} onChange={handleChange} placeholder="React, TypeScript, Tailwind CSS" />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="p-highlights">项目亮点 (用逗号分隔)</label>
          <input id="p-highlights" className="sg-form-input" name="highlights" value={formData.highlights} onChange={handleChange} placeholder="响应式设计, 支付集成, 实时通知" />
        </div>

        <div className="sg-modal-grid-2">
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="p-start">开始日期</label>
            <input type="month" id="p-start" className="sg-form-input" name="start_date" value={formData.start_date} onChange={handleChange} />
          </div>
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="p-end">结束日期</label>
            <input type="month" id="p-end" className="sg-form-input" name="end_date" value={formData.end_date} onChange={handleChange} />
          </div>
        </div>
      </form>
    </SpiritModalShell>
  )
}
