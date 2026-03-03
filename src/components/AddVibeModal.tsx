import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useBreakpoint } from '@/utils/useBreakpoint'

interface AddVibeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddVibeModal({ isOpen, onClose, onSuccess }: AddVibeModalProps) {
  const { isMobile } = useBreakpoint()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    icon: '✨',
    description: '',
    url: '',
  })

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    const projectData = {
      id: crypto.randomUUID(),
      name: formData.name,
      icon: formData.icon,
      description: formData.description,
      url: formData.url,
    }

    const { error } = await supabase.from('vibe_coding').insert([projectData])
    setIsSubmitting(false)

    if (error) {
      console.error('Error inserting vibe project:', error)
      alert('新增项目失败：' + error.message)
    } else {
      onSuccess()
      onClose()
      setFormData({
        name: '',
        icon: '✨',
        description: '',
        url: '',
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
            <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>新增 Vibe Coding 项目</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '24px', cursor: 'pointer' }}>×</button>
          </div>
          
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <form id="add-vibe-form" onSubmit={handleSubmit}>
              <div>
                <label style={labelStyle}>项目名称 *</label>
                <input required style={inputStyle} name="name" value={formData.name} onChange={handleChange} placeholder="例: AI思维圆桌" />
              </div>

              <div>
                <label style={labelStyle}>图标 / Emoji *</label>
                <input required style={{ ...inputStyle, width: '100px', textAlign: 'center' }} name="icon" value={formData.icon} onChange={handleChange} placeholder="🪑" />
              </div>

              <div>
                <label style={labelStyle}>一句话描述 *</label>
                <textarea required style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} name="description" value={formData.description} onChange={handleChange} placeholder="让思想，在分歧中变得完整..." />
              </div>

              <div>
                <label style={labelStyle}>访问链接 (URL) *</label>
                <input required style={inputStyle} name="url" type="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
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
              form="add-vibe-form"
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
              {isSubmitting ? '提交中...' : '确认完成'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
