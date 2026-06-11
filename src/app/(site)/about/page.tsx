import { AboutGarden } from '@/components/home/about/AboutGarden'
import { personalInfo } from '@/data/site/personal'

export const metadata = {
  title: '园主 · SpiritGarden',
  description: `${personalInfo.name} — ${personalInfo.title}。履历、技能与联系方式。`,
}

export default function AboutPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--herb">
      <AboutGarden />
    </div>
  )
}
