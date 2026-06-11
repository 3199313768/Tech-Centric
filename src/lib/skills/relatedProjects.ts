import type { AllProjectItem } from '@/data/site/allProjects'
import type { AgentSkill } from '@/lib/skills/queries'
import { skillsDetail } from '@/data/site/personal'
import { projectRoute } from '@/lib/site/routes'

export interface SkillProjectLink {
  projectId: string
  projectName: string
  href: string
  matchReason: string
}

export function getRelatedProjectsForSkill(
  skill: AgentSkill,
  projects: AllProjectItem[],
): SkillProjectLink[] {
  const needles = [
    skill.name.toLowerCase(),
    ...skill.tags.map((tag) => tag.toLowerCase()),
  ].filter(Boolean)

  const matched = projects
    .filter((project) => {
      const haystack = [
        project.name,
        project.description,
        project.roleAndContribution,
        ...project.tags,
        ...project.techStack,
      ]
        .join(' ')
        .toLowerCase()

      return needles.some((needle) => haystack.includes(needle))
    })
    .map((project) => ({
      projectId: project.id,
      projectName: project.name,
      href: projectRoute(project.slug),
      matchReason: '标签/技术栈匹配',
    }))

  if (matched.length > 0) {
    return matched.slice(0, 4)
  }

  const staticSkill = skillsDetail.find(
    (item) => item.name.toLowerCase() === skill.name.toLowerCase(),
  )

  if (!staticSkill?.projects?.length) {
    return []
  }

  return staticSkill.projects
    .map((projectName) => {
      const project = projects.find((item) =>
        item.name.toLowerCase().includes(projectName.toLowerCase()) ||
        projectName.toLowerCase().includes(item.name.toLowerCase()),
      )
      if (!project) return null
      return {
        projectId: project.id,
        projectName: project.name,
        href: projectRoute(project.slug),
        matchReason: '履历技能关联',
      }
    })
    .filter((item): item is SkillProjectLink => item !== null)
    .slice(0, 4)
}

export function buildSkillProjectMap(
  skills: AgentSkill[],
  projects: AllProjectItem[],
): Record<string, SkillProjectLink[]> {
  return Object.fromEntries(
    skills.map((skill) => [skill.id, getRelatedProjectsForSkill(skill, projects)]),
  )
}
