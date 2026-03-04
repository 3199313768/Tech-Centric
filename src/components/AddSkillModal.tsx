import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useBreakpoint } from '@/utils/useBreakpoint'

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

export function AddSkillModal({ isOpen, onClose, onSuccess, initialData }: AddSkillModalProps) {
  const { isMobile } = useBreakpoint()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    icon: '💡',
    description: '',
    tags: '',
    platform: '',
    link: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        icon: initialData.icon,
        description: initialData.description,
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        platform: initialData.platform || '',
        link: initialData.link || '',
      })
    } else {
      setFormData({
        name: '',
        icon: '💡',
        description: '',
        tags: '',
        platform: '',
        link: '',
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

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
      alert((initialData ? '修改' : '新增') + '技能失败：' + error.message)
    } else {
      onSuccess()
      onClose()
      setFormData({
        name: '',
        icon: '💡',
        description: '',
        tags: '',
        platform: '',
        link: '',
      })
    }
  }

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
            maxWidth: '500px',
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
            <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>{initialData ? '修改 AI 技能' : '新增 AI 技能'}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <form id="add-skill-form" onSubmit={handleSubmit}>
              <div>
                <label style={labelStyle}>技能名称 *</label>
                <input required style={inputStyle} name="name" value={formData.name} onChange={handleChange} placeholder="例: 自动提交代码 (auto-commit)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>图标 *</label>
                  <input required style={{ ...inputStyle, textAlign: 'center' }} name="icon" value={formData.icon} onChange={handleChange} placeholder="Emoji" />
                </div>
                <div>
                  <label style={labelStyle}>平台 (选填)</label>
                  <input style={inputStyle} name="platform" value={formData.platform} onChange={handleChange} placeholder="例: Python、Shell" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>描述 *</label>
                <textarea required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} name="description" value={formData.description} onChange={handleChange} placeholder="关于这个技能的简单描述" />
              </div>

              <div>
                <label style={labelStyle}>标签 (用逗号分隔)</label>
                <input style={inputStyle} name="tags" value={formData.tags} onChange={handleChange} placeholder="Git, Python, AI" />
              </div>

              <div>
                <label style={labelStyle}>项目仓库/演示链接 (选填)</label>
                <input style={inputStyle} name="link" type="url" value={formData.link} onChange={handleChange} placeholder="https://github.com/..." />
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
              form="add-skill-form"
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
