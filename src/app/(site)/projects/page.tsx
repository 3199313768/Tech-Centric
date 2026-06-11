import { AllProjects } from '@/components/home/AllProjects'

export const metadata = {
  title: '项目归档 · SpiritGarden',
  description: '个人项目归档与作品集。',
}

export default function ProjectsPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <AllProjects />
    </div>
  )
}
