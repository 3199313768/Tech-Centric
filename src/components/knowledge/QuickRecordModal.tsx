'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKeyPressEvent } from 'react-use'
import { X, Image as ImageIcon, FileText, Code2, Link as LinkIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TagInput } from './TagInput'

type RecordType = 'text' | 'code' | 'image' | 'file'

export function QuickRecordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [type, setType] = useState<RecordType>('text')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Cmd+K or Ctrl+Space to toggle
  useKeyPressEvent((e) => (e.metaKey && e.key === 'k') || (e.ctrlKey && e.code === 'Space'), (e) => {
    e.preventDefault()
    setIsOpen((prev) => !prev)
  })

  // Escape to close
  useKeyPressEvent('Escape', () => {
    if (isOpen) setIsOpen(false)
  })

  // Auto focus and logic resets when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    } else {
      // Reset state on close after animation finishes
      setTimeout(() => {
        setType('text')
        setContent('')
        setTags([])
        setFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        setIsSubmitting(false)
      }, 300)
    }
  }, [isOpen])

  // Handle paste events (e.g. for images)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const pastedFile = item.getAsFile()
        if (pastedFile) {
          setType('image')
          setFile(pastedFile)
          setPreviewUrl(URL.createObjectURL(pastedFile))
        }
        break
      }
    }
  }

  const handleSubmit = async () => {
    if ((type === 'text' || type === 'code') && !content.trim()) return
    if ((type === 'image' || type === 'file') && !file) return

    setIsSubmitting(true)
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let finalContent = content

      // 2. Upload file if necessary
      if ((type === 'image' || type === 'file') && file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${crypto.randomUUID()}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('kb_assets')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        finalContent = data.path
      }

      // 3. Insert record
      const { error: insertError } = await supabase
        .from('kb_records')
        .insert({
          user_id: user.id,
          type,
          content: finalContent,
          tags,
        })

      if (insertError) throw insertError

      // Success
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to save record:', error)
      alert('保存失败，请查看控制台')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Overlay */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm font-medium">✨ 快速归档</span>
                  <div className="hidden sm:flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">Cmd</kbd>
                    <span className="text-zinc-500 text-xs">+</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">K</kbd>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 round-full hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Input Area */}
              <div className="p-4 flex flex-col gap-4">
                {/* Type Selector */}
                <div className="flex bg-zinc-800/50 p-1 rounded-lg w-fit">
                  {(
                    [
                      { id: 'text', icon: FileText, label: '笔记' },
                      { id: 'code', icon: Code2, label: '片段' },
                      { id: 'image', icon: ImageIcon, label: '图片' },
                      { id: 'file', icon: LinkIcon, label: '文件' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                        type === t.id
                          ? 'bg-zinc-700 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Content Input Area */}
                <div className="min-h-[120px]">
                  {type === 'image' && previewUrl ? (
                    <div className="relative group rounded-md overflow-hidden bg-zinc-950 flex items-center justify-center min-h-[120px] max-h-[300px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="max-h-[300px] object-contain" />
                      <button
                        onClick={() => {
                          setFile(null)
                          setPreviewUrl(null)
                          setType('text')
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onPaste={handlePaste}
                      placeholder={
                        type === 'code' ? '粘贴你的代码片段...' : 
                        type === 'image' ? '支持直接粘贴截图（Ctrl+V）' :
                        '记录些什么...'
                      }
                      className={`w-full bg-transparent border-none resize-none focus:ring-0 text-white placeholder-zinc-500  min-h-[120px] max-h-[40vh] ${type === 'code' ? 'font-mono text-sm' : ''}`}
                    />
                  )}
                </div>

                {/* Tags and Footer */}
                <div className="flex items-end justify-between gap-4 pt-2 border-t border-zinc-800/50">
                   <div className="flex-1">
                      <TagInput tags={tags} onChange={setTags} />
                   </div>
                   
                   <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || ((type === 'text' || type === 'code') && !content.trim()) || ((type === 'image' || type === 'file') && !file)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        保存中
                      </>
                    ) : (
                      <>
                        保存
                        <div className="hidden sm:flex items-center gap-0.5 ml-1 opacity-60">
                          <kbd className="text-[10px] font-mono">⌘</kbd>
                          <kbd className="text-[10px] font-mono">↵</kbd>
                        </div>
                      </>
                    )}
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
