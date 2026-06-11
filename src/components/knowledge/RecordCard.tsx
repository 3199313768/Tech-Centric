'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Calendar,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { SpiritListCard } from '@/components/spirit/SpiritListCard'
import { useToast } from '@/components/spirit/ToastProvider'
import { deleteKbRecord } from '@/lib/knowledge/actions'
import { KB_SIGNED_URL_TTL_SEC } from '@/lib/knowledge/constants'
import { EditRecordModal } from './EditRecordModal'
import { DeleteConfirmBar } from '@/components/spirit/DeleteConfirmBar'
import type { KbRecord } from '@/lib/knowledge/types'

interface RecordCardProps {
  record: KbRecord
  index?: number
}

const TYPE_LABELS: Record<string, string> = {
  text: '笔记',
  code: '代码',
  image: '图片',
  file: '附件',
}

export function RecordCard({ record, index = 0 }: RecordCardProps) {
  const isMediaType = record.type === 'image' || record.type === 'file'
  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  const [assetLoading, setAssetLoading] = useState(isMediaType)
  const [urlRefreshKey, setUrlRefreshKey] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<KbRecord | null>(null)
  const [actionsVisible, setActionsVisible] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const loadAssetUrl = useCallback(() => {
    setUrlRefreshKey((key) => key + 1)
  }, [])

  useEffect(() => {
    if (!isMediaType) return

    let cancelled = false

    supabase.storage
      .from('kb_assets')
      .createSignedUrl(record.content, KB_SIGNED_URL_TTL_SEC)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          setAssetUrl(data.signedUrl)
        } else {
          console.error('Failed to load asset URL:', error)
          setAssetUrl(null)
        }
        setAssetLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isMediaType, record.content, supabase.storage, urlRefreshKey])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(record.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
      toast('复制失败', 'error')
    }
  }

  const TypeIcon = {
    text: FileText,
    code: Code2,
    image: ImageIcon,
    file: LinkIcon,
  }[record.type as string] || FileText

  const handleDelete = async () => {
    setIsDeleting(true)
    const { error } = await deleteKbRecord(record.id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)

    if (error) {
      toast(error, 'error')
      return
    }

    toast('记录已删除', 'success')
  }

  const handleImageError = () => {
    setAssetLoading(true)
    loadAssetUrl()
  }

  return (
    <>
      <SpiritListCard
        variant="list"
        index={index}
        className={`sg-kb-card break-inside-avoid${isDeleting ? ' sg-kb-card--deleting' : ''}`}
        actionsVisible={actionsVisible || isDeleting || showDeleteConfirm}
        actions={
          <>
            <button
              type="button"
              className="sg-icon-btn"
              onClick={(e) => {
                e.stopPropagation()
                setEditingRecord(record)
              }}
              title="编辑"
            >
              ✎
            </button>
            <button
              type="button"
              className="sg-icon-btn sg-icon-btn--danger"
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              disabled={isDeleting}
              title="删除"
            >
              {isDeleting ? <Loader2 className="sg-kb-spinner" aria-hidden /> : '×'}
            </button>
          </>
        }
      >
        <div
          onMouseEnter={() => setActionsVisible(true)}
          onMouseLeave={() => setActionsVisible(false)}
        >
          <div className="sg-kb-card-meta">
            <div className="sg-kb-card-type">
              <TypeIcon className="sg-kb-card-type-icon" aria-hidden />
              <span>{TYPE_LABELS[record.type] || record.type}</span>
            </div>
            <div className="sg-kb-card-date">
              <Calendar className="sg-kb-card-date-icon" aria-hidden />
              <span>{new Date(record.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="sg-kb-card-body">
            {record.type === 'text' ? (
              <div className="sg-prose">
                <ReactMarkdown>{record.content}</ReactMarkdown>
              </div>
            ) : null}

            {record.type === 'code' ? (
              <div className="sg-kb-code-block">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="sg-kb-code-copy"
                  title="复制代码"
                >
                  {copied ? (
                    <Check className="sg-kb-code-copy-icon sg-kb-code-copy-icon--ok" aria-hidden />
                  ) : (
                    <Copy className="sg-kb-code-copy-icon" aria-hidden />
                  )}
                </button>
                <div className="sg-kb-code-content">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {`\`\`\`\n${record.content}\n\`\`\``}
                  </ReactMarkdown>
                </div>
              </div>
            ) : null}

            {record.type === 'image' ? (
              <div className="sg-kb-image-wrap">
                {assetUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={assetUrl}
                    alt="知识库图片"
                    className="sg-kb-image"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="sg-kb-image-placeholder">
                    {assetLoading ? '加载加密图像中...' : '图像加载失败，正在重试…'}
                  </div>
                )}
                {assetUrl ? (
                  <a
                    href={assetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sg-kb-image-overlay"
                  >
                    <span className="sg-kb-image-overlay-label">
                      <ExternalLink className="sg-kb-image-overlay-icon" aria-hidden />
                      查看原图
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}

            {record.type === 'file' ? (
              <a
                href={assetUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="sg-kb-file-link"
                onClick={(e) => {
                  if (!assetUrl) e.preventDefault()
                }}
              >
                <div className="sg-kb-file-icon">
                  <FileText className="sg-kb-file-icon-svg" aria-hidden />
                </div>
                <div className="sg-kb-file-info">
                  <h4 className="sg-kb-file-name">
                    {record.content.split('/').pop() || '加密附件'}
                  </h4>
                  <p className="sg-kb-file-hint">
                    {assetUrl ? '点击下载 / 预览' : '加载链接中…'}
                  </p>
                </div>
              </a>
            ) : null}
          </div>

          {record.tags && record.tags.length > 0 ? (
            <div className="sg-card__tags sg-kb-card-tags">
              {record.tags.map((tag: string) => (
                <span key={tag} className="sg-tag">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {showDeleteConfirm ? (
            <DeleteConfirmBar
              message="确定删除？不可撤销"
              onCancel={() => setShowDeleteConfirm(false)}
              onConfirm={handleDelete}
              isLoading={isDeleting}
            />
          ) : null}
        </div>
      </SpiritListCard>

      {editingRecord ? (
        <EditRecordModal
          key={editingRecord.id}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      ) : null}
    </>
  )
}
