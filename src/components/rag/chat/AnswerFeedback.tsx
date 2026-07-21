'use client'

import { useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { RagFeedbackReason } from '@/lib/rag/feedback'

interface AnswerFeedbackProps {
  responseId: string
  sessionId: string
}

type FeedbackStatus = 'idle' | 'submitting' | 'saved' | 'error'

interface FeedbackSelection {
  helpful: boolean
  reason?: RagFeedbackReason
}

const NEGATIVE_REASONS: Array<{ value: RagFeedbackReason; label: string }> = [
  { value: 'inaccurate', label: '内容不准确' },
  { value: 'irrelevant_sources', label: '来源不相关' },
  { value: 'did_not_answer', label: '没有回答问题' },
  { value: 'incomplete', label: '回答不完整' },
  { value: 'other', label: '其他原因' },
]

export function AnswerFeedback({ responseId, sessionId }: AnswerFeedbackProps) {
  const [status, setStatus] = useState<FeedbackStatus>('idle')
  const [selection, setSelection] = useState<FeedbackSelection | null>(null)
  const [showReasons, setShowReasons] = useState(false)

  async function submitFeedback(nextSelection: FeedbackSelection) {
    setSelection(nextSelection)
    setStatus('submitting')

    try {
      const response = await fetch('/api/rag/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId,
          sessionId,
          helpful: nextSelection.helpful,
          ...(nextSelection.reason ? { reason: nextSelection.reason } : {}),
        }),
      })

      if (response.status !== 204) throw new Error('反馈保存失败')
      setStatus('saved')
      setShowReasons(!nextSelection.helpful)
    } catch {
      setStatus('error')
    }
  }

  function chooseHelpful() {
    setShowReasons(false)
    void submitFeedback({ helpful: true })
  }

  function chooseNotHelpful() {
    setShowReasons(true)
    if (selection?.helpful) setStatus('idle')
  }

  return (
    <div className="sg-rag-feedback">
      <div className="sg-rag-feedback__prompt">
        <span>这个回答有帮助吗？</span>
        <div className="sg-rag-feedback__actions">
          <button
            type="button"
            className="sg-rag-feedback__button"
            aria-label="这个回答有帮助"
            aria-pressed={selection?.helpful === true}
            disabled={status === 'submitting'}
            onClick={chooseHelpful}
          >
            <ThumbsUp aria-hidden />
            有帮助
          </button>
          <button
            type="button"
            className="sg-rag-feedback__button"
            aria-label="这个回答没有帮助"
            aria-pressed={selection?.helpful === false}
            disabled={status === 'submitting'}
            onClick={chooseNotHelpful}
          >
            <ThumbsDown aria-hidden />
            没帮助
          </button>
        </div>
      </div>

      {showReasons ? (
        <div className="sg-rag-feedback__reasons" aria-label="选择没有帮助的原因">
          <span className="sg-rag-feedback__reason-label">哪里需要改进？</span>
          <div className="sg-rag-feedback__reason-options">
            {NEGATIVE_REASONS.map(reason => (
              <button
                key={reason.value}
                type="button"
                className="sg-rag-feedback__reason"
                aria-pressed={selection?.helpful === false && selection.reason === reason.value}
                disabled={status === 'submitting'}
                onClick={() => void submitFeedback({ helpful: false, reason: reason.value })}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="sg-rag-feedback__status" role="status" aria-live="polite">
        {status === 'submitting' ? '正在保存反馈…' : null}
        {status === 'saved' ? '已匿名记录，谢谢你的反馈。' : null}
        {status === 'error' ? (
          <>
            反馈暂时未保存。
            <button
              type="button"
              className="sg-rag-feedback__retry"
              onClick={() => selection && void submitFeedback(selection)}
            >
              重试
            </button>
          </>
        ) : null}
        {status === 'idle' ? '反馈仅用于匿名改进回答质量。' : null}
      </div>
    </div>
  )
}
