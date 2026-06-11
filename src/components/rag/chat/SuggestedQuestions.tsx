export interface SuggestedItem {
  id: string
  label: string
  value: string
  type: 'question' | 'action'
}

const DEFAULT_ITEMS: SuggestedItem[] = [
  { id: 'ask-projects', label: '问项目', value: '你做过哪些 AI 相关项目？', type: 'question' },
  { id: 'ask-skills', label: '看技术栈', value: '你的主要技术栈是什么？', type: 'question' },
  { id: 'ask-resources', label: '资源推荐', value: '有什么前端学习资源推荐？', type: 'question' },
  { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
]

interface SuggestedQuestionsProps {
  items?: SuggestedItem[]
  onSelect: (item: SuggestedItem) => void
}

export function SuggestedQuestions({ items = DEFAULT_ITEMS, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="sg-rag-chips">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="sg-filter-chip sg-rag-chip"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
