import { KnowledgeNav } from '@/components/knowledge/KnowledgeNav'

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="spirit-garden-shell">
      <KnowledgeNav />
      {children}
    </div>
  )
}
