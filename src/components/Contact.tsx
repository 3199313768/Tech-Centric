'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { personalInfo } from '@/data/personal'
import { PaperCard } from './PaperCard'
import Image from 'next/image'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // 从 localStorage 恢复表单数据
  useEffect(() => {
    const savedData = localStorage.getItem('contact-form-data')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (e) {
        // 忽略解析错误
      }
    }
  }, [])

  // 保存表单数据到 localStorage
  useEffect(() => {
    if (Object.values(formData).some(v => v)) {
      localStorage.setItem('contact-form-data', JSON.stringify(formData))
    }
  }, [formData])

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return '姓名不能为空'
        if (value.trim().length < 2) return '姓名至少需要2个字符'
        return undefined
      case 'email':
        if (!value.trim()) return '邮箱不能为空'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return '请输入有效的邮箱地址'
        return undefined
      case 'subject':
        if (!value.trim()) return '主题不能为空'
        if (value.trim().length < 3) return '主题至少需要3个字符'
        return undefined
      case 'message':
        if (!value.trim()) return '消息不能为空'
        if (value.trim().length < 10) return '消息至少需要10个字符'
        return undefined
      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 实时验证已触摸的字段
    if (touchedFields.has(name)) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTouchedFields(prev => new Set(prev).add(name))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 标记所有字段为已触摸
    const allFields = ['name', 'email', 'subject', 'message']
    setTouchedFields(new Set(allFields))
    
    // 验证所有字段
    const newErrors: FormErrors = {}
    allFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) newErrors[field as keyof FormErrors] = error
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrors({})

    try {
      // 构建邮件正文
      // 注意：formData 中的信息都是发送者（访客）填写的信息
      const senderName = formData.name.trim()        // 发送者姓名
      const senderEmail = formData.email.trim()       // 发送者邮箱
      const emailSubject = formData.subject.trim()     // 发送者填写的主题
      const emailMessage = formData.message.trim()    // 发送者填写的消息
      
      // 构建邮件正文，包含发送者信息
      const emailBody = [
        `姓名：${senderName}`,
        `发件人邮箱：${senderEmail}`,
        '',
        '---',
        '',
        emailMessage
      ].join('\n')

      // 构建 mailto 链接
      // 收件人是固定的：3199313768@qq.com
      const recipientEmail = '3199313768@qq.com'
      const subject = encodeURIComponent(emailSubject)
      const body = encodeURIComponent(emailBody)
      const cc = encodeURIComponent(senderEmail)  // 抄送给发送者，方便回复
      
      const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}&cc=${cc}`

      // 打开邮件客户端，预填充发送者填写的信息
      window.location.href = mailtoLink

      // 显示成功提示
      setIsSubmitting(false)
      setSubmitStatus('success')
      
      // 延迟清空表单，给用户时间看到成功提示
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '' })
        localStorage.removeItem('contact-form-data')
        setTouchedFields(new Set())
      }, 2000)
      
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } catch (error) {
      setIsSubmitting(false)
      setSubmitStatus('error')
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 4000)
    }
  }

  const messageLength = formData.message.length
  const maxMessageLength = 1000

  return (
    <motion.div
      style={{
        padding: '120px 40px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
        color: '#fff',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 杂志式标题 */}
      <motion.h2
        className="magazine-headline"
        style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          fontWeight: 'bold',
          marginBottom: '64px',
          fontFamily: 'var(--font-space-mono), monospace',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          color: '#00d9ff',
          textShadow: '0 0 30px rgba(0, 217, 255, 0.6)',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        联系我
      </motion.h2>

      {/* 引用块 */}
      <motion.div
        className="magazine-quote"
        style={{ marginBottom: '64px' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p
          style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.95)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            margin: 0,
          }}
        >
          有任何想法、合作机会或只是想聊聊？欢迎通过以下方式联系我。
        </p>
      </motion.div>

      {/* 主要内容区域 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
        }}
      >
        {/* 联系表单 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3
            className="magazine-subheadline"
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '24px',
              fontFamily: 'var(--font-space-mono), monospace',
              color: '#00d9ff',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            发送消息
          </h3>

          {/* 邮箱提示信息 */}
          {personalInfo.socialLinks.email && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              style={{
                marginBottom: '24px',
                padding: '16px 20px',
                backgroundColor: 'rgba(0, 217, 255, 0.05)',
                border: '1px solid rgba(0, 217, 255, 0.2)',
                borderRadius: '4px',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                如需直接联系，请发送邮件至：
                <a
                  href={personalInfo.socialLinks.email}
                  style={{
                    color: '#00d9ff',
                    textDecoration: 'none',
                    marginLeft: '8px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#00b8d9'
                    e.currentTarget.style.textShadow = '0 0 8px rgba(0, 217, 255, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#00d9ff'
                    e.currentTarget.style.textShadow = 'none'
                  }}
                >
                  {personalInfo.socialLinks.email.replace('mailto:', '')}
                </a>
              </p>
            </motion.div>
          )}
          
          <PaperCard>
            <form onSubmit={handleSubmit}>
              {/* 姓名 */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  姓名 *
                </label>
                <motion.input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    color: '#fff',
                    backgroundColor: 'rgba(0, 217, 255, 0.05)',
                    border: errors.name
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  whileFocus={{
                    borderColor: errors.name ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 217, 255, 0.6)',
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  }}
                />
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#ef4444',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      }}
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* 邮箱 */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  邮箱 *
                </label>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    color: '#fff',
                    backgroundColor: 'rgba(0, 217, 255, 0.05)',
                    border: errors.email
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  whileFocus={{
                    borderColor: errors.email ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 217, 255, 0.6)',
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  }}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#ef4444',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* 主题 */}
              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="subject"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  主题 *
                </label>
                <motion.input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    color: '#fff',
                    backgroundColor: 'rgba(0, 217, 255, 0.05)',
                    border: errors.subject
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '4px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  whileFocus={{
                    borderColor: errors.subject ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 217, 255, 0.6)',
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  }}
                />
                <AnimatePresence>
                  {errors.subject && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#ef4444',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      }}
                    >
                      {errors.subject}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* 消息 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label
                    htmlFor="message"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    消息 *
                  </label>
                  <span
                    style={{
                      fontSize: '12px',
                      color: messageLength > maxMessageLength
                        ? '#ef4444'
                        : 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {messageLength} / {maxMessageLength}
                  </span>
                </div>
                <motion.textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows={8}
                  maxLength={maxMessageLength}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    color: '#fff',
                    backgroundColor: 'rgba(0, 217, 255, 0.05)',
                    border: errors.message
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '4px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.3s ease',
                  }}
                  whileFocus={{
                    borderColor: errors.message ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 217, 255, 0.6)',
                    backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  }}
                />
                <AnimatePresence>
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#ef4444',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                      }}
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* 提交状态消息 */}
              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      padding: '16px',
                      marginBottom: '20px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '4px',
                      color: '#22c55e',
                      fontSize: '14px',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    ✓ 消息已发送！我会尽快回复您。
                  </motion.div>
                )}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      padding: '16px',
                      marginBottom: '20px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '4px',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    }}
                  >
                    ✗ 发送失败，请稍后重试。
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 32px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  fontWeight: 'bold',
                  color: '#0a0a0a',
                  backgroundColor: isSubmitting ? 'rgba(0, 217, 255, 0.5)' : '#00d9ff',
                  border: '2px solid #00d9ff',
                  borderRadius: '0',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  boxShadow: '0 0 25px rgba(0, 217, 255, 0.6)',
                  transition: 'all 0.3s ease',
                }}
                whileHover={!isSubmitting ? {
                  scale: 1.02,
                  backgroundColor: '#00b8d9',
                  boxShadow: '0 0 35px rgba(0, 217, 255, 0.8)',
                } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                animate={isSubmitting ? {
                  boxShadow: [
                    '0 0 25px rgba(0, 217, 255, 0.6)',
                    '0 0 35px rgba(0, 217, 255, 0.8)',
                    '0 0 25px rgba(0, 217, 255, 0.6)',
                  ],
                } : {}}
                transition={isSubmitting ? {
                  boxShadow: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                } : {}}
              >
                {isSubmitting ? '发送中...' : '发送消息'}
              </motion.button>
            </form>
          </PaperCard>
        </motion.div>

        {/* 联系方式信息 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3
            className="magazine-subheadline"
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '32px',
              fontFamily: 'var(--font-space-mono), monospace',
              color: '#00d9ff',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            联系方式
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* 响应时间 */}
            <PaperCard delay={0.1}>
              <h4
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--font-space-mono), monospace',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                响应时间
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  lineHeight: '1.6',
                  margin: 0,
                }}
              >
                我通常会在24-48小时内回复您的消息。如果是紧急事项，请通过其他渠道联系我。
              </p>
            </PaperCard>

            {/* 微信二维码 */}
            <PaperCard delay={0.2}>
              <div style={{ textAlign: 'center' }}>
                <h4
                  style={{
                    fontSize: '16px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  微信
                </h4>
                <motion.div
                  style={{
                    display: 'inline-block',
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 8px 30px rgba(0, 217, 255, 0.4)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/wechat-qrcode.png"
                    alt="微信二维码"
                    width={200}
                    height={200}
                    style={{
                      display: 'block',
                      borderRadius: '4px',
                    }}
                  />
                </motion.div>
                <p
                  style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  扫一扫上面的二维码图案，加我为朋友
                </p>
              </div>
            </PaperCard>

            {/* 社交媒体链接 */}
            <PaperCard delay={0.3}>
              <h4
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: 'var(--font-space-mono), monospace',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                社交媒体
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {personalInfo.socialLinks.github && (
                  <motion.a
                    href={personalInfo.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 18px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      borderRadius: '4px',
                      color: '#00d9ff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{
                      borderColor: 'rgba(0, 217, 255, 0.6)',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    GitHub
                  </motion.a>
                )}
                {personalInfo.socialLinks.linkedin && (
                  <motion.a
                    href={personalInfo.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 18px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      borderRadius: '4px',
                      color: '#00d9ff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{
                      borderColor: 'rgba(0, 217, 255, 0.6)',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    LinkedIn
                  </motion.a>
                )}
                {personalInfo.socialLinks.twitter && (
                  <motion.a
                    href={personalInfo.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 18px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      borderRadius: '4px',
                      color: '#00d9ff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{
                      borderColor: 'rgba(0, 217, 255, 0.6)',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Twitter
                  </motion.a>
                )}
                {personalInfo.socialLinks.website && (
                  <motion.a
                    href={personalInfo.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 18px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      borderRadius: '4px',
                      color: '#00d9ff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontFamily: 'var(--font-space-mono), monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      transition: 'all 0.2s ease',
                    }}
                    whileHover={{
                      borderColor: 'rgba(0, 217, 255, 0.6)',
                      backgroundColor: 'rgba(0, 217, 255, 0.1)',
                      scale: 1.05,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Website
                  </motion.a>
                )}
              </div>
            </PaperCard>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
