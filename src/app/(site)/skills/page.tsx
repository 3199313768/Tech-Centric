import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchAiSkillsPageData } from '@/lib/skills/queries'

const AiSkills = dynamic(
  () => import('@/components/home/skills/AiSkills').then((m) => ({ default: m.AiSkills })),
  { loading: () => <SitePageFallback label="技能工坊" /> },
)

export const metadata = {
  title: '技能工坊 · SpiritGarden',
  description: 'Agent Skills 集合与开发效率工具。',
}

async function SkillsPageContent() {
  const { skills, error } = await fetchAiSkillsPageData()

  if (error) {
    return <div className="sg-kb-error">加载技能失败：{error.message}</div>
  }

  return <AiSkills initialSkills={skills} />
}

export default function SkillsPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
      <Suspense fallback={<SitePageFallback label="技能工坊" />}>
        <SkillsPageContent />
      </Suspense>
    </div>
  )
}
