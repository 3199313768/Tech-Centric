import { Check, Loader2 } from 'lucide-react'
import type { RagLoadingStage } from '@/lib/rag/chatUi'

const STAGES: Array<{ id: RagLoadingStage; label: string }> = [
  { id: 'understanding', label: '正在理解问题' },
  { id: 'retrieving', label: '正在检索资料' },
  { id: 'generating', label: '正在组织回答' },
]

interface LoadingStatusProps {
  stage: RagLoadingStage
}

export function LoadingStatus({ stage }: LoadingStatusProps) {
  const activeIndex = STAGES.findIndex(item => item.id === stage)

  return (
    <div className="sg-rag-loading" aria-live="polite" aria-label={STAGES[activeIndex].label}>
      {STAGES.map((item, index) => {
        const isComplete = index < activeIndex
        const isActive = index === activeIndex
        return (
          <span
            key={item.id}
            className={`sg-rag-loading__stage${isActive ? ' sg-rag-loading__stage--active' : ''}${isComplete ? ' sg-rag-loading__stage--complete' : ''}`}
          >
            <span className="sg-rag-loading__marker" aria-hidden>
              {isComplete ? <Check /> : isActive ? <Loader2 /> : null}
            </span>
            {item.label}
          </span>
        )
      })}
    </div>
  )
}
