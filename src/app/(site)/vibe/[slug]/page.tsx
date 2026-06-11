import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VibeDetailView } from '@/components/home/vibe/VibeDetailView'
import { fetchVibeEntryBySlug } from '@/lib/vibe/queries'

interface VibeDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: VibeDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = await fetchVibeEntryBySlug(slug)

  if (!entry) {
    return { title: '手札未找到 · SpiritGarden' }
  }

  return {
    title: `${entry.name} · 草本集`,
    description: entry.description,
  }
}

export default async function VibeDetailPage({ params }: VibeDetailPageProps) {
  const { slug } = await params
  const entry = await fetchVibeEntryBySlug(slug)

  if (!entry) {
    notFound()
  }

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--herb">
      <VibeDetailView entry={entry} />
    </div>
  )
}
