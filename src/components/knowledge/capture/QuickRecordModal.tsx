'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useKeyPressEvent } from 'react-use'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SpiritModalShell } from '@/components/spirit/shell/SpiritModalShell'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import { KB_MAX_FILE_SIZE } from '@/lib/knowledge/constants'
import { TagInput } from '@/components/knowledge/shared/TagInput'
import { RecordTypeTabs, type RecordTypeId } from '@/components/knowledge/shared/RecordTypeTabs'

type RecordType = RecordTypeId

const EMPTY_FORM = {
  type: 'text' as RecordType,
  content: '',
  tags: [] as string[],
  file: null as File | null,
  previewUrl: null as string | null,
}

export function QuickRecordModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<RecordType>(EMPTY_FORM.type)
  const [content, setContent] = useState(EMPTY_FORM.content)
  const [tags, setTags] = useState<string[]>(EMPTY_FORM.tags)
  const [isPublic, setIsPublic] = useState(false)
  const [file, setFile] = useState<File | null>(EMPTY_FORM.file)
  const [previewUrl, setPreviewUrl] = useState<string | null>(EMPTY_FORM.previewUrl)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const resetForm = useCallback(() => {
    setType(EMPTY_FORM.type)
    setContent(EMPTY_FORM.content)
    setTags(EMPTY_FORM.tags)
    setIsPublic(false)
    setFile(EMPTY_FORM.file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return EMPTY_FORM.previewUrl
    })
    setError(null)
    setIsSubmitting(false)
  }, [])

  const closeModal = useCallback(() => {
    if (isSubmitting) return
    setIsOpen(false)
    resetForm()
  }, [isSubmitting, resetForm])

  useKeyPressEvent(
    (e) => (e.metaKey && e.key === 'k') || (e.ctrlKey && e.code === 'Space'),
    (e) => {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    },
  )

  useKeyPressEvent('Escape', () => {
    if (isOpen) closeModal()
  })

  useEffect(() => {
    const handleOpenModal = () => {
      resetForm()
      setIsOpen(true)
    }
    window.addEventListener('open-quick-record', handleOpenModal)
    return () => window.removeEventListener('open-quick-record', handleOpenModal)
  }, [resetForm])

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 100)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  const validateFile = (nextFile: File): string | null => {
    if (nextFile.size > KB_MAX_FILE_SIZE) {
      return '文件体积过大，请上传小于 5MB 的资源'
    }
    return null
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const pastedFile = item.getAsFile()
        if (!pastedFile) break

        const fileError = validateFile(pastedFile)
        if (fileError) {
          setError(fileError)
          toast(fileError, 'error')
          break
        }

        setError(null)
        setType('image')
        setFile(pastedFile)
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(pastedFile)
        })
        break
      }
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    if ((type === 'text' || type === 'code') && !content.trim()) return
    if ((type === 'image' || type === 'file') && !file) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      let finalContent = content

      if ((type === 'image' || type === 'file') && file) {
        const fileError = validateFile(file)
        if (fileError) {
          setError(fileError)
          toast(fileError, 'error')
          return
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError, data } = await supabase.storage
          .from('kb_assets')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        finalContent = data.path
      }

      const { error: insertError } = await supabase.from('kb_records').insert({
        user_id: user.id,
        type,
        content: finalContent,
        tags,
        is_public: isPublic,
      })

      if (insertError) throw insertError

      toast('记录已保存', 'success')
      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存失败'
      console.error('Failed to save record:', err)
      setError(message)
      toast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    !isSubmitting &&
    ((type === 'text' || type === 'code') ? content.trim().length > 0 : !!file)

  return (
    <SpiritModalShell
      isOpen={isOpen}
      onClose={closeModal}
      title="快速归档"
      subtitle="按 Cmd+K 随时唤起；支持粘贴截图与 # 标签分类"
      maxWidth={672}
      panelClassName="sg-modal-panel sg-kb-modal-panel"
      footer={
        <>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={closeModal} disabled={isSubmitting}>
            取消
          </button>
          <button
            type="button"
            className="sg-btn sg-btn--primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="sg-kb-spinner" aria-hidden />
                保存中
              </>
            ) : (
              '保存'
            )}
          </button>
        </>
      }
    >
      <div className="sg-kb-modal-body">
        <RecordTypeTabs
          value={type}
          onChange={(next) => setType(next as RecordType)}
          mode="select"
        />

        <div className="sg-form-field sg-kb-modal-content">
          {type === 'image' && previewUrl ? (
            <div className="sg-kb-modal-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="预览" className="sg-kb-modal-preview-img" />
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setPreviewUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev)
                    return null
                  })
                  setType('text')
                }}
                className="sg-kb-modal-preview-remove"
                aria-label="移除图片"
              >
                <X className="sg-kb-modal-preview-remove-icon" aria-hidden />
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder={
                type === 'code'
                  ? '粘贴你的代码片段...'
                  : type === 'image'
                    ? '支持直接粘贴截图（Ctrl+V）'
                    : '记录些什么...'
              }
              className={`sg-form-textarea sg-kb-modal-textarea${type === 'code' ? ' sg-kb-modal-textarea--code' : ''}`}
            />
          )}
        </div>

        <div className="sg-kb-modal-tags">
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <label className="sg-kb-public-toggle">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
          />
          <span>公开此记录（可被访客与 AI 助手引用）</span>
        </label>

        {error ? <div className="sg-kb-error sg-kb-error--inline">{error}</div> : null}
      </div>
    </SpiritModalShell>
  )
}
