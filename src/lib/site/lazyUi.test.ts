import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('site route lazy UI policy', () => {
  it('provides a route-level loading fallback for the site group', () => {
    const source = readSource('src/app/(site)/loading.tsx')

    expect(source).toContain('SitePageFallback')
    expect(source).toContain('variant="default"')
  })

  it('scopes the garden skeleton to the URL-preserving home route group', () => {
    const loadingSource = readSource('src/app/(site)/(home)/loading.tsx')
    const pageSource = readSource('src/app/(site)/(home)/page.tsx')

    expect(loadingSource).toContain('variant="home"')
    expect(pageSource).toContain('SpiritGardenHome')
  })

  it('matches the garden home skeleton to the real hero and card grid', () => {
    const source = readSource('src/components/spirit/feedback/skeletons/HomePageSkeleton.tsx')

    expect(source).toContain('sg-hero-stage--garden')
    expect(source).toContain('sg-garden-grid')
    expect(source).toContain('sg-card--featured')
    expect(source).toContain('sg-card--meter')
    expect(source).toContain('sg-home-skeleton__profile-meta')
  })

  it('provides the knowledge route with its archive skeleton', () => {
    const source = readSource('src/app/(knowledge)/knowledge/loading.tsx')

    expect(source).toContain('variant="knowledge"')
  })

  it.each([
    ['projects', 'archive'],
    ['skills', 'workshop'],
    ['resources', 'resources'],
    ['vibe', 'herb'],
  ])('uses the real %s page skeleton instead of the group fallback', (route, variant) => {
    const source = readSource(`src/app/(site)/${route}/loading.tsx`)

    expect(source).toContain(`variant="${variant}"`)
  })

  it('mounts project management dialogs only while active', () => {
    const source = readSource('src/components/home/projects/AllProjects.tsx')

    expect(source).toContain('const ProjectModal = dynamic')
    expect(source).toMatch(/\{selectedProject \? \(\s*<ProjectModal/u)
    expect(source).toMatch(/\{isAddModalOpen \? \(\s*<AddAllProjectModal/u)
  })

  it('mounts skill management UI only while active', () => {
    const source = readSource('src/components/home/skills/AiSkills.tsx')

    expect(source).toContain('const SkillDeleteConfirm = dynamic')
    expect(source).toMatch(/\{confirmDeleteId === skill\.id \? \(\s*<SkillDeleteConfirm/u)
    expect(source).toMatch(/\{isAddModalOpen \? \(\s*<AddSkillModal/u)
  })

  it('mounts resource management dialogs only while active', () => {
    const source = readSource('src/components/home/resources/ResourceLinks.tsx')

    expect(source).toMatch(/\{confirmConfig\.isOpen \? \(\s*<ResourceConfirmModal/u)
    expect(source).toMatch(/\{showDiscoveryModal \? \(\s*<ResourceDiscoveryModal/u)
    expect(source).toMatch(/\{showForm \? \(\s*<ResourceFormModal/u)
  })
})
