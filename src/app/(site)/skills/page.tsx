import { AiSkills } from '@/components/home/AiSkills'

export const metadata = {
  title: '技能工坊 · SpiritGarden',
  description: 'Agent Skills 集合与开发效率工具卷轴。',
}

export default function SkillsPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
      <AiSkills />
    </div>
  )
}
