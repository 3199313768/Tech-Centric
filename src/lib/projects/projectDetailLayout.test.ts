import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('project detail section-card layout', () => {
  it('marks narrative sections and contact as surface panels', () => {
    const source = readSource('src/components/home/projects/ProjectDetailView.tsx')

    expect(source).toContain('sg-project-detail__panel')
    expect(source).toMatch(/className="sg-project-detail__panel"/u)
    expect(source).toMatch(
      /className="sg-project-detail__contact sg-project-detail__panel"/u,
    )
    expect(source).toContain('sg-project-detail__actions')
    expect(source).not.toMatch(
      /sg-project-detail__actions[^"]*sg-project-detail__panel/u,
    )
  })

  it('styles panels as elevated surface cards with weak borders', () => {
    const css = readSource('src/app/globals.css')

    expect(css).toContain('.sg-project-detail__panel')
    expect(css).toContain('var(--sg-surface-elevated)')
    expect(css).toContain('var(--sg-border-subtle)')
    expect(css).toContain('var(--sg-radius-lg')
    expect(css).toMatch(/\.sg-project-detail__media\s*\{[^}]*box-shadow:/u)
    expect(css).toMatch(/\.sg-project-detail__hero\s+h1\s*\{/u)
  })
})
