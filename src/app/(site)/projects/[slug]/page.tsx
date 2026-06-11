import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectDetailView } from '@/components/home/projects/ProjectDetailView'
import { fetchProjectBySlug } from '@/lib/projects/queries'

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await fetchProjectBySlug(slug)

  if (!project) {
    return { title: '项目未找到 · SpiritGarden' }
  }

  return {
    title: `${project.name} · 项目归档`,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      images: project.screenshots[0] ? [{ url: project.screenshots[0] }] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params
  const project = await fetchProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <ProjectDetailView project={project} />
    </div>
  )
}
