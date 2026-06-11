import type { ContactSummaryData } from '@/lib/rag/types'

interface ContactSummaryProps {
  summary: ContactSummaryData
}

export function ContactSummary({ summary }: ContactSummaryProps) {
  return (
    <div className="sg-rag-summary">
      <p className="sg-rag-summary__label">邮件草稿</p>
      <div className="sg-rag-summary__fields">
        <p><span className="sg-rag-summary__field-label">收件人：</span>{summary.email}</p>
        <p><span className="sg-rag-summary__field-label">电话：</span>{summary.phone}</p>
        <p><span className="sg-rag-summary__field-label">主题：</span>{summary.subject}</p>
        <pre className="sg-rag-summary__body">{summary.body}</pre>
      </div>
    </div>
  )
}
