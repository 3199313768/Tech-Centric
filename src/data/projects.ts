export type ProjectType = 'React' | 'Vue' | 'Node' | 'AI' | 'Mobile' | 'Other'

export interface Project {
  id: string
  title: string
  type: ProjectType
  description: string
  detailedDescription?: string
  image?: string
  demoUrl?: string
  githubUrl?: string
  technologies: string[]
  highlights: string[]
  status: 'completed' | 'in-progress' | 'archived'
  startDate?: string
  endDate?: string
}
