import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('project detail section-card layout', () => {
  it('marks narrative sections as surface panels and keeps CTA in hero top-right', () => {
    const source = readSource('src/components/home/projects/ProjectDetailView.tsx')

    expect(source).toContain('sg-project-detail__panel')
    expect(source).toMatch(/className="sg-project-detail__panel"/u)
    expect(source).toContain('sg-project-detail__hero-top')
    expect(source).toContain('sg-project-detail__actions')
    expect(source).not.toMatch(
      /sg-project-detail__actions[^"]*sg-project-detail__panel/u,
    )
    expect(source).not.toContain('合作或内推')
    expect(source).not.toContain('sg-project-detail__contact')
  })

  it('styles panels as elevated surface cards with weak borders', () => {
    const css = readSource('src/app/globals.css')

    expect(css).toContain('.sg-project-detail__panel')
    expect(css).toContain('var(--sg-surface-elevated)')
    expect(css).toContain('var(--sg-border-subtle)')
    expect(css).toContain('var(--sg-radius-lg')
    expect(css).toMatch(/\.sg-project-detail__media\s*\{[^}]*box-shadow:/u)
    expect(css).toMatch(/\.sg-project-detail__hero\s+h1\s*\{/u)
    expect(css).toContain('.sg-project-detail__hero-top')
    expect(css).not.toContain('.sg-project-detail__contact')
  })
})
