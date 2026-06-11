'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { SpiritModalShell } from '@/components/spirit/shell/SpiritModalShell'
import { TagInput } from '@/components/knowledge/shared/TagInput'
import { RecordTypeTabs, type RecordTypeId } from '@/components/knowledge/shared/RecordTypeTabs'
import { updateKbRecord } from '@/lib/knowledge/actions'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import type { KbRecord } from '@/lib/knowledge/types'

interface EditRecordModalProps {
  record: KbRecord | null
  onClose: () => void
}

export function EditRecordModal({ record, onClose }: EditRecordModalProps) {
  const { toast } = useToast()
  const [type, setType] = useState<RecordTypeId>((record?.type as RecordTypeId) ?? 'text')
  const [content, setContent] = useState(record?.content ?? '')
  const [tags, setTags] = useState<string[]>(record?.tags ?? [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!record) return null

  const isMediaType = record.type === 'image' || record.type === 'file'
  const canEditContent = !isMediaType

  const handleSubmit = async () => {
    if (canEditContent && !content.trim()) {
      setError('内容不能为空')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const { error: updateError } = await updateKbRecord(record.id, {
      type,
      content: canEditContent ? content.trim() : record.content,
      tags,
    })

    setIsSubmitting(false)

    if (updateError) {
      setError(updateError)
      toast(updateError, 'error')
      return
    }

    toast('记录已更新', 'success')
    onClose()
  }

  return (
    <SpiritModalShell
      isOpen={!!record}
      onClose={onClose}
      title="编辑记录"
      subtitle={isMediaType ? '附件类记录仅可修改类型与标签' : '修改内容与标签'}
      maxWidth={672}
      panelClassName="sg-modal-panel sg-kb-modal-panel"
      footer={
        <>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="sg-btn sg-btn--primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
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
        <RecordTypeTabs value={type} onChange={(next) => setType(next as RecordTypeId)} mode="select" />

        {canEditContent ? (
          <div className="sg-form-field sg-kb-modal-content">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`sg-form-textarea sg-kb-modal-textarea${type === 'code' ? ' sg-kb-modal-textarea--code' : ''}`}
            />
          </div>
        ) : (
          <p className="sg-kb-tag-empty">附件路径不可编辑，可调整标签与类型。</p>
        )}

        <div className="sg-kb-modal-tags">
          <TagInput tags={tags} onChange={setTags} />
        </div>

        {error ? <div className="sg-kb-error sg-kb-error--inline">{error}</div> : null}
      </div>
    </SpiritModalShell>
  )
}
