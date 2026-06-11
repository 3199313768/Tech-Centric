import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SitePageFallback } from '@/components/spirit/feedback/SitePageFallback'
import { fetchAllProjectsPageData } from '@/lib/projects/queries'
import { fetchAiSkillsPageData } from '@/lib/skills/queries'
import { buildSkillProjectMap } from '@/lib/skills/relatedProjects'

const AiSkills = dynamic(
  () => import('@/components/home/skills/AiSkills').then((m) => ({ default: m.AiSkills })),
  { loading: () => <SitePageFallback label="技能工坊" variant="workshop" /> },
)

export const metadata = {
  title: '技能工坊 · SpiritGarden',
  description: 'Agent Skills 集合与开发效率工具。',
}

async function SkillsPageContent() {
  const [{ skills, error }, { projects }] = await Promise.all([
    fetchAiSkillsPageData(),
    fetchAllProjectsPageData(),
  ])

  if (error) {
    return <div className="sg-kb-error">加载技能失败：{error.message}</div>
  }

  const skillProjectMap = buildSkillProjectMap(skills, projects)

  return <AiSkills initialSkills={skills} skillProjectMap={skillProjectMap} />
}

export default function SkillsPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
      <Suspense fallback={<SitePageFallback label="技能工坊" variant="workshop" />}>
        <SkillsPageContent />
      </Suspense>
    </div>
  )
}
