import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ProjectType } from '@/data/projects'
import { useBreakpoint } from '@/utils/useBreakpoint'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddProjectModal({ isOpen, onClose, onSuccess }: AddProjectModalProps) {
  const { isMobile } = useBreakpoint()
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
    
    // Process comma separated lists
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
      // Reset form
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
            <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>新增项目</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <form id="add-project-form" onSubmit={handleSubmit}>
              <div>
                <label style={labelStyle}>项目名称 *</label>
                <input required style={inputStyle} name="title" value={formData.title} onChange={handleChange} placeholder="输入项目名称" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>类型 *</label>
                  <select required style={inputStyle} name="type" value={formData.type} onChange={handleChange}>
                    <option value="React">React</option>
                    <option value="Vue">Vue</option>
                    <option value="Node">Node</option>
                    <option value="AI">AI</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>状态 *</label>
                  <select required style={inputStyle} name="status" value={formData.status} onChange={handleChange}>
                    <option value="completed">已完成 (Completed)</option>
                    <option value="in-progress">进行中 (In Progress)</option>
                    <option value="archived">已归档 (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>简短描述 *</label>
                <textarea required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} name="description" value={formData.description} onChange={handleChange} placeholder="项目的一句话或简短描述" />
              </div>

              <div>
                <label style={labelStyle}>详细描述</label>
                <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} name="detailed_description" value={formData.detailed_description} onChange={handleChange} placeholder="项目的详细说明" />
              </div>

              <div>
                <label style={labelStyle}>封面图片 URL</label>
                <input style={inputStyle} name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>演示链接 (Demo URL)</label>
                  <input style={inputStyle} name="demo_url" value={formData.demo_url} onChange={handleChange} placeholder="https://..." />
                </div>
                <div>
                  <label style={labelStyle}>GitHub 链接</label>
                  <input style={inputStyle} name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <div>
                <label style={labelStyle}>技术栈 (用逗号分隔)</label>
                <input required style={inputStyle} name="technologies" value={formData.technologies} onChange={handleChange} placeholder="React, TypeScript, Tailwind CSS" />
              </div>

              <div>
                <label style={labelStyle}>项目亮点 (用逗号分隔)</label>
                <input style={inputStyle} name="highlights" value={formData.highlights} onChange={handleChange} placeholder="响应式设计, 支付集成, 实时通知" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>开始日期</label>
                  <input type="month" style={inputStyle} name="start_date" value={formData.start_date} onChange={handleChange} />
                </div>
                <div>
                  <label style={labelStyle}>结束日期</label>
                  <input type="month" style={inputStyle} name="end_date" value={formData.end_date} onChange={handleChange} />
                </div>
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
              form="add-project-form"
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
              {isSubmitting ? '保存中...' : '确认新增'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
