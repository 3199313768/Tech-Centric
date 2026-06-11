'use client'

import { useState } from 'react'
import { type AllProjectItem, type ProjectCategory } from '@/data/site/allProjects'
import { saveAllProject } from '@/lib/projects/actions'
import { SpiritModalShell } from '@/components/spirit/shell/SpiritModalShell'
import { useToast } from '@/components/spirit/feedback/ToastProvider'

interface AddAllProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: AllProjectItem | null
}

function buildAllProjectForm(initialData?: AllProjectItem | null) {
  if (initialData) {
    return {
      name: initialData.name,
      url: initialData.url,
      is_public: initialData.isPublic,
      category: initialData.category,
      description: initialData.description,
      role_and_contribution: initialData.roleAndContribution || '',
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      screenshots: Array.isArray(initialData.screenshots) ? initialData.screenshots.join(', ') : '',
    }
  }
  return {
    name: '',
    url: '',
    is_public: true,
    category: '未分类' as ProjectCategory,
    description: '',
    role_and_contribution: '',
    tags: '',
    screenshots: '',
  }
}

export function AddAllProjectModal({ isOpen, onClose, onSuccess, initialData }: AddAllProjectModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(() => buildAllProjectForm(initialData))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'is_public') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const tagsArray = formData.tags.split(',').map(s => s.trim()).filter(Boolean)
    const screenshotsArray = formData.screenshots.split(',').map(s => s.trim()).filter(Boolean)

    const projectData = {
      id: initialData?.id,
      name: formData.name,
      url: formData.url,
      isPublic: formData.is_public,
      category: formData.category,
      description: formData.description,
      roleAndContribution: formData.role_and_contribution || '',
      tags: tagsArray,
      screenshots: screenshotsArray,
    }

    const { error } = await saveAllProject(projectData)

    setIsSubmitting(false)

    if (error) {
      console.error('Error saving project:', error)
      toast(`${initialData ? '修改' : '新增'}项目失败：${error}`, 'error')
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
      title={initialData ? '修改全部项目' : '新增“全部项目”'}
      maxWidth={600}
      footer={
        <>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="submit"
            form="add-all-project-form"
            className="sg-btn sg-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : initialData ? '确认修改' : '确认新增'}
          </button>
        </>
      }
    >
      <form id="add-all-project-form" onSubmit={handleSubmit}>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="ap-name">项目名称 *</label>
          <input required id="ap-name" className="sg-form-input" name="name" value={formData.name} onChange={handleChange} placeholder="输入项目名称" />
        </div>

        <div className="sg-modal-grid-2">
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="ap-category">分类 *</label>
            <select required id="ap-category" className="sg-form-select" name="category" value={formData.category} onChange={handleChange}>
              <option value="数字孪生">数字孪生</option>
              <option value="后台与管理系统">后台与管理系统</option>
              <option value="门户与展现">门户与展现</option>
              <option value="未分类">未分类</option>
            </select>
          </div>
          <div className="sg-form-field">
            <label className="sg-form-label" htmlFor="ap-public">访问权限 *</label>
            <select required id="ap-public" className="sg-form-select" name="is_public" value={formData.is_public ? 'true' : 'false'} onChange={handleChange}>
              <option value="true">公网可见</option>
              <option value="false">内部系统 (不可见)</option>
            </select>
          </div>
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="ap-url">访问链接 URL *</label>
          <input required id="ap-url" className="sg-form-input" name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="ap-desc">业务痛点 / 核心功能描述 *</label>
          <textarea required id="ap-desc" className="sg-form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="项目的作用或解决的问题" />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="ap-role">主导工作 / 核心贡献</label>
          <textarea id="ap-role" className="sg-form-textarea" name="role_and_contribution" value={formData.role_and_contribution} onChange={handleChange} placeholder="在这个项目里做了什么..." />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="ap-tags">技术标签 (用逗号分隔)</label>
          <input id="ap-tags" className="sg-form-input" name="tags" value={formData.tags} onChange={handleChange} placeholder="Vue3, Echarts, WebGL 等" />
        </div>

        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="ap-shots">预览图 URL (用逗号分隔多个)</label>
          <input id="ap-shots" className="sg-form-input" name="screenshots" value={formData.screenshots} onChange={handleChange} placeholder="https://..., https://..." />
        </div>
      </form>
    </SpiritModalShell>
  )
}
