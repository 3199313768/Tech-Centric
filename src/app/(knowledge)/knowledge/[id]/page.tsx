import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicRecordView } from '@/components/knowledge/browse/PublicRecordView'
import { fetchPublicKbRecord } from '@/lib/knowledge/queries'
import { fetchRelatedPublicKbRecords } from '@/lib/knowledge/relatedRecords'

interface KnowledgePublicPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: KnowledgePublicPageProps): Promise<Metadata> {
  const { id } = await params
  const record = await fetchPublicKbRecord(id)

  if (!record) {
    return { title: '记录未找到 · 档案馆' }
  }

  const summary = record.content.slice(0, 120)
  return {
    title: `知识库记录 · 档案馆`,
    description: summary,
  }
}

export default async function KnowledgePublicPage({ params }: KnowledgePublicPageProps) {
  const { id } = await params
  const record = await fetchPublicKbRecord(id)

  if (!record) {
    notFound()
  }

  const relatedRecords = await fetchRelatedPublicKbRecords(record.id, record.tags ?? [])

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <PublicRecordView record={record} relatedRecords={relatedRecords} />
    </div>
  )
}
