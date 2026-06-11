export type VibeKind = 'project' | 'note' | 'article'

export interface VibeEntry {
  id: string
  slug: string
  name: string
  description: string
  url: string
  icon: string
  kind: VibeKind
  body: string
  isPublic: boolean
  tags: string[]
}
