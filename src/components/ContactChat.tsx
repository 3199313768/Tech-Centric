'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { personalInfo } from '@/data/personal'
import Image from 'next/image'
import { useBreakpoint } from '@/utils/useBreakpoint'

// ─── 类型定义 ───

type ChatStage = 'greeting' | 'name' | 'email' | 'message' | 'confirm' | 'done'
type Sender = 'bot' | 'user'

interface Message {
  id: string
  sender: Sender
  text: string
  timestamp: Date
}

// ─── 常量 ───

const AVATAR_SRC = '/images/avatar.jpg'
const PHONE = '17613712197'
const RECIPIENT_EMAIL = '3199313768@qq.com'

const quickReplies = [
  { emoji: '💼', label: '合作咨询' },
  { emoji: '💬', label: '技术交流' },
  { emoji: '🎯', label: '面试机会' },
  { emoji: '👋', label: '就是打个招呼' },
]

// ─── 头像组件（复用） ───

function Avatar({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={AVATAR_SRC}
      alt="Oxygen"
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  )
}

// ─── 打字指示器组件 ───

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <Avatar />
      <div
        style={{
          padding: '12px 18px',
          borderRadius: '18px 18px 18px 4px',
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-cyan)',
              display: 'inline-block',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ─── 气泡组件 ───

function ChatBubble({ message }: { message: Message }) {
  const isBot = message.sender === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        display: 'flex',
        flexDirection: isBot ? 'row' : 'row-reverse',
        alignItems: 'flex-end',
        gap: '10px',
        marginBottom: '16px',
      }}
    >
      {/* 头像 */}
      {isBot && <Avatar />}

      {/* 气泡 */}
      <div style={{ maxWidth: '75%' }}>
        <div
          style={{
            padding: '12px 18px',
            borderRadius: isBot
              ? '18px 18px 18px 4px'
              : '18px 18px 4px 18px',
            backgroundColor: isBot
              ? 'var(--color-card-bg)'
              : 'var(--color-cyan)',
            border: isBot ? '1px solid var(--color-card-border)' : 'none',
            color: isBot ? 'var(--color-text-primary)' : '#000',
            fontSize: '15px',
            lineHeight: '1.6',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            whiteSpace: 'pre-line',
            boxShadow: isBot
              ? '0 2px 8px var(--color-card-shadow)'
              : '0 2px 12px var(--color-cyan-glow)',
          }}
        >
          {message.text}
        </div>
      </div>
    </motion.div>
  )
}

// ─── 手机号卡片组件 ───

function PhoneCard() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PHONE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = PHONE
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: 'var(--color-cyan-10)',
        border: '1px solid var(--color-cyan-20)',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '16px' }}>📞</span>
        <div>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-space-mono), monospace',
              margin: '0 0 2px',
            }}
          >
            手机号
          </p>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-space-mono), monospace',
              margin: 0,
              letterSpacing: '1px',
            }}
          >
            {PHONE}
          </p>
        </div>
      </div>
      <motion.button
        onClick={handleCopy}
        style={{
          padding: '6px 14px',
          borderRadius: '16px',
          border: '1px solid var(--color-cyan-30)',
          backgroundColor: copied ? 'var(--color-cyan)' : 'transparent',
          color: copied ? '#000' : 'var(--color-cyan)',
          fontSize: '12px',
          fontFamily: 'var(--font-space-mono), monospace',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {copied ? '已复制 ✓' : '复制'}
      </motion.button>
    </div>
  )
}

// ─── 社交链接卡片 ───

function SocialLinksCard({ onRestart }: { onRestart: () => void }) {
  const { isMobile } = useBreakpoint()
  const links = [
    personalInfo.socialLinks.github && {
      name: 'GitHub',
      url: personalInfo.socialLinks.github,
      icon: '🐙',
    },
    personalInfo.socialLinks.linkedin && {
      name: 'LinkedIn',
      url: personalInfo.socialLinks.linkedin,
      icon: '💼',
    },
    personalInfo.socialLinks.email && {
      name: 'Email',
      url: personalInfo.socialLinks.email,
      icon: '📧',
    },
    personalInfo.socialLinks.twitter && {
      name: 'Twitter',
      url: personalInfo.socialLinks.twitter,
      icon: '🐦',
    },
  ].filter(Boolean) as { name: string; url: string; icon: string }[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
        boxShadow: '0 4px 20px var(--color-card-shadow)',
        marginTop: '8px',
        marginLeft: isMobile ? '0' : '42px',
      }}
    >
      {/* 社交按钮 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        {links.map((link) => (
          <motion.a
            key={link.name}
            href={link.url}
            target={link.name === 'Email' ? undefined : '_blank'}
            rel="noopener noreferrer"
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--color-cyan-30)',
              backgroundColor: 'var(--color-cyan-10)',
              color: 'var(--color-cyan)',
              textDecoration: 'none',
              fontSize: '13px',
              fontFamily: 'var(--font-space-mono), monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: 'var(--color-cyan-20)',
              borderColor: 'var(--color-cyan)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </motion.a>
        ))}
      </div>

      {/* 手机号 */}
      <PhoneCard />

      {/* 微信二维码 */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            marginBottom: '12px',
            fontFamily: 'var(--font-space-mono), monospace',
          }}
        >
          📱 或者扫码加我微信
        </p>
        <motion.div
          style={{
            display: 'inline-block',
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 30px var(--color-cyan-glow-strong)',
          }}
        >
          <Image
            src="/images/wechat-qrcode.png"
            alt="微信二维码"
            width={160}
            height={160}
            style={{ display: 'block', borderRadius: '8px' }}
          />
        </motion.div>
      </div>

      {/* 重新开始对话 */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <motion.button
          onClick={onRestart}
          style={{
            padding: '8px 20px',
            borderRadius: '20px',
            border: '1px dashed var(--color-card-border)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          whileHover={{
            scale: 1.05,
            color: 'var(--color-cyan)',
            borderColor: 'var(--color-cyan-30)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          💬 重新开始对话
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── 快捷联系栏 ───

function QuickContactBar() {
  const [phoneCopied, setPhoneCopied] = useState(false)

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(PHONE)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = PHONE
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setPhoneCopied(true)
    setTimeout(() => setPhoneCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px',
        padding: '0 8px',
      }}
    >
      <motion.a
        href={`mailto:${RECIPIENT_EMAIL}`}
        style={{
          padding: '6px 14px',
          borderRadius: '16px',
          border: '1px solid var(--color-cyan-20)',
          backgroundColor: 'var(--color-cyan-10)',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
          fontSize: '12px',
          fontFamily: 'var(--font-space-mono), monospace',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
        }}
        whileHover={{
          scale: 1.05,
          borderColor: 'var(--color-cyan)',
          color: 'var(--color-cyan)',
        }}
      >
        <span>📧</span> {RECIPIENT_EMAIL}
      </motion.a>
      <motion.button
        onClick={handleCopyPhone}
        style={{
          padding: '6px 14px',
          borderRadius: '16px',
          border: '1px solid var(--color-cyan-20)',
          backgroundColor: phoneCopied ? 'var(--color-cyan)' : 'var(--color-cyan-10)',
          color: phoneCopied ? '#000' : 'var(--color-text-secondary)',
          fontSize: '12px',
          fontFamily: 'var(--font-space-mono), monospace',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
        }}
        whileHover={{
          scale: 1.05,
          borderColor: 'var(--color-cyan)',
          color: phoneCopied ? '#000' : 'var(--color-cyan)',
        }}
      >
        <span>📞</span> {phoneCopied ? '已复制!' : PHONE}
      </motion.button>
    </motion.div>
  )
}

// ─── 主组件 ───

export function ContactChat() {
  const { isMobile } = useBreakpoint()
  const [messages, setMessages] = useState<Message[]>([])
  const [stage, setStage] = useState<ChatStage>('greeting')
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [inputError, setInputError] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  // 添加 bot 消息（带打字延迟）
  const addBotMessage = useCallback(
    (text: string, nextStage?: ChatStage, delay = 1200) => {
      setIsTyping(true)
      scrollToBottom()

      setTimeout(() => {
        setIsTyping(false)
        const msg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, msg])
        if (nextStage) setStage(nextStage)
        scrollToBottom()
      }, delay)
    },
    [scrollToBottom]
  )

  // 添加用户消息
  const addUserMessage = (text: string) => {
    const msg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, msg])
    scrollToBottom()
  }

  // 初始欢迎语
  useEffect(() => {
    const timer1 = setTimeout(() => {
      addBotMessage('你好！👋 我是 Oxygen，很高兴你来到这里！', undefined, 800)
    }, 500)

    const timer2 = setTimeout(() => {
      addBotMessage('我的邮箱是 3199313768@qq.com，也可以直接给我发邮件哦 📮\n\n请问怎么称呼你？', 'name', 1000)
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 聚焦输入框
  useEffect(() => {
    if (stage === 'name' || stage === 'email' || stage === 'message') {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [stage])

  // 验证邮箱
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // 回退上一步
  const handleGoBack = () => {
    setInputError('')
    setInputValue('')

    // 删除当前阶段相关的最近 bot 消息和 user 消息
    setMessages((prev) => {
      const newMsgs = [...prev]
      // 删最后两条（bot 的提问 + user 的回答，如果存在）
      // 先删 bot 最后一条
      for (let i = newMsgs.length - 1; i >= 0; i--) {
        if (newMsgs[i].sender === 'bot') {
          newMsgs.splice(i)
          break
        }
      }
      return newMsgs
    })

    switch (stage) {
      case 'email':
        setFormData((prev) => ({ ...prev, name: '' }))
        setTimeout(() => {
          addBotMessage('请问怎么称呼你？', 'name', 600)
        }, 200)
        break
      case 'message':
        setFormData((prev) => ({ ...prev, email: '' }))
        setTimeout(() => {
          addBotMessage(
            `好的，${formData.name}！方便留个邮箱吗？这样我可以回复你 📮`,
            'email',
            600
          )
        }, 200)
        break
    }
  }

  // 提交输入
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const value = inputValue.trim()
    if (!value) return

    setInputError('')

    switch (stage) {
      case 'name':
        if (value.length < 2) {
          setInputError('名字至少需要2个字符哦')
          return
        }
        addUserMessage(value)
        setFormData((prev) => ({ ...prev, name: value }))
        setInputValue('')
        setTimeout(() => {
          addBotMessage(
            `太好了，${value}！方便留个邮箱吗？这样我可以回复你 📮`,
            'email'
          )
        }, 300)
        break

      case 'email':
        if (!validateEmail(value)) {
          setInputError('这个邮箱格式好像不太对，再检查一下？')
          return
        }
        addUserMessage(value)
        setFormData((prev) => ({ ...prev, email: value }))
        setInputValue('')
        setTimeout(() => {
          addBotMessage(
            'OK！有什么想对我说的？或者你也可以直接选择下面的话题 👇',
            'message'
          )
        }, 300)
        break

      case 'message':
        if (value.length < 2) {
          setInputError('说点什么吧，哪怕只是一句问候 😊')
          return
        }
        addUserMessage(value)
        setFormData((prev) => ({ ...prev, message: value }))
        setInputValue('')
        setTimeout(() => {
          addBotMessage(
            `收到！我整理一下... 📝\n\n` +
              `姓名：${formData.name}\n` +
              `邮箱：${formData.email}\n` +
              `消息：${value}\n\n` +
              `确认发送吗？`,
            'confirm'
          )
        }, 300)
        break
    }
  }

  // 快速回复
  const handleQuickReply = (reply: string) => {
    setInputValue('')
    addUserMessage(reply)
    setFormData((prev) => ({ ...prev, message: reply }))
    setTimeout(() => {
      addBotMessage(
        `收到！我整理一下... 📝\n\n` +
          `姓名：${formData.name}\n` +
          `邮箱：${formData.email}\n` +
          `消息：${reply}\n\n` +
          `确认发送吗？`,
        'confirm'
      )
    }, 300)
  }

  // 发送邮件
  const handleSend = () => {
    const subject = encodeURIComponent(`来自 ${formData.name} 的消息`)
    const body = encodeURIComponent(
      [
        `姓名：${formData.name}`,
        `发件人邮箱：${formData.email}`,
        '',
        '---',
        '',
        formData.message,
      ].join('\n')
    )
    const cc = encodeURIComponent(formData.email)
    window.location.href = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}&cc=${cc}`

    setTimeout(() => {
      addBotMessage(
        '消息已准备好！邮件客户端会自动打开 🚀\n\n也可以通过以下方式找到我：',
        'done'
      )
    }, 500)
  }

  // 重来
  const handleReset = () => {
    setMessages([])
    setFormData({ name: '', email: '', message: '' })
    setInputValue('')
    setInputError('')
    setStage('greeting')
    setIsTyping(false)

    setTimeout(() => {
      addBotMessage('好的，我们重新开始！👋', undefined, 600)
    }, 300)

    setTimeout(() => {
      addBotMessage('请问怎么称呼你？', 'name', 800)
    }, 1500)
  }

  // 获取输入框 placeholder
  const getPlaceholder = (): string => {
    switch (stage) {
      case 'name':
        return '输入你的名字...'
      case 'email':
        return '输入你的邮箱...'
      case 'message':
        return '输入你想说的话...'
      default:
        return ''
    }
  }

  // 是否显示输入框
  const showInput = stage === 'name' || stage === 'email' || stage === 'message'
  // 是否显示返回按钮（邮箱和消息阶段可以回退）
  const showBack = stage === 'email' || stage === 'message'

  return (
    <motion.div
      style={{
        padding: isMobile ? '80px 12px 20px' : '120px 20px 40px',
        maxWidth: '720px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 聊天头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          marginBottom: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-card-border)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            margin: '0 auto 12px',
            boxShadow: '0 0 20px var(--color-cyan-glow-strong)',
            overflow: 'hidden',
          }}
        >
          <Avatar size={64} />
        </div>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-space-mono), monospace',
            margin: '0 0 4px',
          }}
        >
          Oxygen
        </h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            margin: 0,
          }}
        >
          通常在 24 小时内回复
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                display: 'inline-block',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: '#22c55e',
                fontFamily: 'var(--font-space-mono), monospace',
              }}
            >
              在线
            </span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-cyan-10)',
              border: '1px solid var(--color-cyan-30)',
            }}
          >
            <span style={{ fontSize: '11px' }}>🎯</span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-cyan)',
                fontFamily: 'var(--font-space-mono), monospace',
              }}
            >
              正在寻找新机会
            </span>
          </div>
        </div>
      </motion.div>

      {/* 快捷联系栏 */}
      <QuickContactBar />

      {/* 消息区域 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '16px',
        }}
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* 打字指示器 */}
        <AnimatePresence>{isTyping && <TypingIndicator />}</AnimatePresence>

        {/* 快速回复按钮 */}
        <AnimatePresence>
          {stage === 'message' && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginLeft: '42px',
                marginBottom: '16px',
              }}
            >
              {quickReplies.map((reply) => (
                <motion.button
                  key={reply.label}
                  onClick={() =>
                    handleQuickReply(`${reply.emoji} ${reply.label}`)
                  }
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--color-cyan-30)',
                    backgroundColor: 'var(--color-cyan-10)',
                    color: 'var(--color-cyan)',
                    fontSize: '13px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: 'var(--color-cyan-20)',
                    borderColor: 'var(--color-cyan)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {reply.emoji} {reply.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 确认按钮 */}
        <AnimatePresence>
          {stage === 'confirm' && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'flex',
                gap: '12px',
                marginLeft: '42px',
                marginBottom: '16px',
              }}
            >
              <motion.button
                onClick={handleSend}
                style={{
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: 'var(--color-cyan)',
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-space-mono), monospace',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px var(--color-cyan-glow-strong)',
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 25px var(--color-cyan-glow-strong)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                发送 ✓
              </motion.button>
              <motion.button
                onClick={handleReset}
                style={{
                  padding: '10px 24px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-space-mono), monospace',
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重来 ↺
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 完成后的社交链接 */}
        <AnimatePresence>
          {stage === 'done' && !isTyping && (
            <SocialLinksCard onRestart={handleReset} />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <AnimatePresence>
        {showInput && !isTyping && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'sticky',
              bottom: 0,
              padding: '16px 0',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            {/* 错误提示 */}
            <AnimatePresence>
              {inputError && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    marginBottom: '8px',
                    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  }}
                >
                  {inputError}
                </motion.p>
              )}
            </AnimatePresence>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              {/* 返回上一步按钮 */}
              {showBack && (
                <motion.button
                  type="button"
                  onClick={handleGoBack}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-card-border)',
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text-muted)',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                  whileHover={{
                    scale: 1.1,
                    color: 'var(--color-cyan)',
                    borderColor: 'var(--color-cyan-30)',
                  }}
                  whileTap={{ scale: 0.9 }}
                  title="返回上一步"
                >
                  ←
                </motion.button>
              )}

              <input
                ref={inputRef}
                type={stage === 'email' ? 'email' : 'text'}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setInputError('')
                }}
                placeholder={getPlaceholder()}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '24px',
                  border: inputError
                    ? '1px solid var(--color-error)'
                    : '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-cyan)'
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px var(--color-cyan-20)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = inputError
                    ? 'var(--color-error)'
                    : 'var(--color-card-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <motion.button
                type="submit"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: inputValue.trim()
                    ? 'var(--color-cyan)'
                    : 'var(--color-cyan-30)',
                  color: '#000',
                  fontSize: '18px',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                  boxShadow: inputValue.trim()
                    ? '0 0 12px var(--color-cyan-glow)'
                    : 'none',
                }}
                whileHover={inputValue.trim() ? { scale: 1.1 } : {}}
                whileTap={inputValue.trim() ? { scale: 0.9 } : {}}
              >
                ↑
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
