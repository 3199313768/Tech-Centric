import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { type AllProjectItem, type ProjectCategory } from '@/data/allProjects'
import { useBreakpoint } from '@/utils/useBreakpoint'

interface AddAllProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: AllProjectItem | null
}

export function AddAllProjectModal({ isOpen, onClose, onSuccess, initialData }: AddAllProjectModalProps) {
  const { isMobile } = useBreakpoint()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    is_public: true,
    category: '未分类' as ProjectCategory,
    description: '',
    role_and_contribution: '',
    tags: '',
    screenshots: '',
  })

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line
      setFormData({
        name: initialData.name,
        url: initialData.url,
        is_public: initialData.isPublic,
        category: initialData.category,
        description: initialData.description,
        role_and_contribution: initialData.roleAndContribution || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        screenshots: Array.isArray(initialData.screenshots) ? initialData.screenshots.join(', ') : '',
      })
    } else {
      setFormData({
        name: '',
        url: '',
        is_public: true,
        category: '未分类',
        description: '',
        role_and_contribution: '',
        tags: '',
        screenshots: '',
      })
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'is_public') {
      // Handle select for boolean
      setFormData(prev => ({ ...prev, [name]: value === 'true' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    
    // Process comma separated lists
    const tagsArray = formData.tags.split(',').map(s => s.trim()).filter(Boolean)
    const screenshotsArray = formData.screenshots.split(',').map(s => s.trim()).filter(Boolean)

    const projectData = {
      id: crypto.randomUUID(),
      name: formData.name,
      url: formData.url,
      is_public: formData.is_public,
      category: formData.category,
      description: formData.description,
      role_and_contribution: formData.role_and_contribution || '',
      tags: tagsArray,
      screenshots: screenshotsArray,
    }

    let error

    if (initialData) {
      const response = await supabase.from('all_projects').update(projectData).eq('id', initialData.id)
      error = response.error
    } else {
      const newProject = { id: crypto.randomUUID(), ...projectData }
      const response = await supabase.from('all_projects').insert([newProject])
      error = response.error
    }

    setIsSubmitting(false)

    if (error) {
      console.error('Error saving project:', error)
      alert((initialData ? '修改' : '新增') + '项目失败：' + error.message)
    } else {
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        name: '',
        url: '',
        is_public: true,
        category: '未分类',
        description: '',
        role_and_contribution: '',
        tags: '',
        screenshots: '',
      })
    }
  }

  if (!isOpen) return null

  const inputStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--color-cyan-30)',
    borderRadius: '4px',
    color: 'var(--color-text-primary)',
    marginBottom: '16px',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          zIndex: 4000,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          padding: isMobile ? '16px' : '40px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            backgroundColor: 'var(--color-bg)',
            borderRadius: '16px',
            border: '1px solid var(--color-cyan-50)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '24px', borderBottom: '1px solid var(--color-cyan-30)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{initialData ? '修改全部项目' : '新增“全部项目”'}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <form id="add-all-project-form" onSubmit={handleSubmit}>
              <div>
                <label style={labelStyle}>项目名称 *</label>
                <input required style={inputStyle} name="name" value={formData.name} onChange={handleChange} placeholder="输入项目名称" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>分类 *</label>
                  <select required style={inputStyle} name="category" value={formData.category} onChange={handleChange}>
                    <option value="数字孪生">数字孪生</option>
                    <option value="后台与管理系统">后台与管理系统</option>
                    <option value="门户与展现">门户与展现</option>
                    <option value="未分类">未分类</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>访问权限 *</label>
                  <select required style={inputStyle} name="is_public" value={formData.is_public ? 'true' : 'false'} onChange={handleChange}>
                    <option value="true">公网可见</option>
                    <option value="false">内部系统 (不可见)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>访问链接 URL *</label>
                <input required style={inputStyle} name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
              </div>

              <div>
                <label style={labelStyle}>业务痛点 / 核心功能描述 *</label>
                <textarea required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} name="description" value={formData.description} onChange={handleChange} placeholder="项目的作用或解决的问题" />
              </div>

              <div>
                <label style={labelStyle}>主导工作 / 核心贡献</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} name="role_and_contribution" value={formData.role_and_contribution} onChange={handleChange} placeholder="在这个项目里做了什么..." />
              </div>

              <div>
                <label style={labelStyle}>技术标签 (用逗号分隔)</label>
                <input style={inputStyle} name="tags" value={formData.tags} onChange={handleChange} placeholder="Vue3, Echarts, WebGL 等" />
              </div>

              <div>
                <label style={labelStyle}>预览图 URL (用逗号分隔多个)</label>
                <input style={inputStyle} name="screenshots" value={formData.screenshots} onChange={handleChange} placeholder="https://..., https://..." />
              </div>

            </form>
          </div>

          <div style={{ padding: '24px', borderTop: '1px solid var(--color-cyan-30)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid var(--color-text-muted)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              form="add-all-project-form"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'var(--color-cyan)',
                border: 'none',
                color: 'var(--color-bg)',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? '保存中...' : (initialData ? '确认修改' : '确认新增')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
