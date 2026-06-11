import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchVibePageData } from '@/lib/vibe/queries'

const VibeCoding = dynamic(
  () => import('@/components/home/vibe/VibeCoding').then((m) => ({ default: m.VibeCoding })),
  { loading: () => <SitePageFallback label="草本集" variant="herb" /> },
)

export const metadata = {
  title: '草本集 · SpiritGarden',
  description: 'Vibe Coding 实验手札与灵感记录。',
}

async function VibePageContent() {
  const { entries, error } = await fetchVibePageData()

  if (error) {
    return <div className="sg-kb-error">加载手札失败：{error.message}</div>
  }

  return <VibeCoding initialEntries={entries} />
}

export default function VibePage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--herb">
      <Suspense fallback={<SitePageFallback label="草本集" variant="herb" />}>
        <VibePageContent />
      </Suspense>
    </div>
  )
}
