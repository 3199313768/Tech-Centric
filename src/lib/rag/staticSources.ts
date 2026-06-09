import { personalInfo, workExperience, skillsDetail, blogPosts } from '../../data/personal'
import { getInitialResources } from '../../data/initialResources'
import type { RagDocumentInput } from './types'

function joinLines(lines: Array<string | undefined | null | false>) {
  return lines.filter(Boolean).join('\n')
}

function uniqueTags(tags: Array<string | undefined | null>) {
  return Array.from(new Set(tags.filter((tag): tag is string => Boolean(tag))))
}

export function getStaticRagDocuments(): RagDocumentInput[] {
  const documents: RagDocumentInput[] = []

  documents.push({
    sourceType: 'static_personal',
    sourceId: 'personal-profile',
    title: `${personalInfo.name} - 个人简介`,
    url: '/',
    summary: personalInfo.title,
    tags: ['个人简介', '技术栈', '经历'],
    isPublic: true,
    content: joinLines([
      `姓名：${personalInfo.name}`,
      `标题：${personalInfo.title}`,
      personalInfo.bio.length ? `简介：${personalInfo.bio.join('\n')}` : undefined,
      personalInfo.skills.length ? `技能：${personalInfo.skills.join('、')}` : undefined,
      personalInfo.socialLinks.email ? `邮箱：${personalInfo.socialLinks.email}` : undefined,
      personalInfo.socialLinks.github ? `GitHub：${personalInfo.socialLinks.github}` : undefined,
      personalInfo.socialLinks.linkedin ? `LinkedIn：${personalInfo.socialLinks.linkedin}` : undefined,
      personalInfo.socialLinks.twitter ? `Twitter：${personalInfo.socialLinks.twitter}` : undefined,
      personalInfo.socialLinks.website ? `网站：${personalInfo.socialLinks.website}` : undefined,
    ]),
  })

  for (const experience of workExperience) {
    documents.push({
      sourceType: 'static_personal',
      sourceId: `work-${experience.id}`,
      title: `${experience.company} - ${experience.position}`,
      url: '/',
      summary: experience.description,
      tags: uniqueTags(['工作经历', experience.company, ...experience.technologies]),
      isPublic: true,
      content: joinLines([
        `公司：${experience.company}`,
        `职位：${experience.position}`,
        `时间：${experience.period}`,
        experience.location ? `地点：${experience.location}` : undefined,
        `描述：${experience.description}`,
        `技术：${experience.technologies.join('、')}`,
        `成果：\n${experience.achievements.map(item => `- ${item}`).join('\n')}`,
      ]),
    })
  }

  documents.push({
    sourceType: 'static_personal',
    sourceId: 'skills-detail',
    title: '技能栈详情',
    url: '/',
    summary: '前端、后端和工具技能栈',
    tags: ['技能', '技术栈'],
    isPublic: true,
    content: skillsDetail.map(skill => joinLines([
      `技能：${skill.name}`,
      `分类：${skill.category}`,
      `熟练度：${skill.proficiency}`,
      skill.yearsOfExperience ? `经验年限：${skill.yearsOfExperience}` : undefined,
      skill.projects?.length ? `相关项目：${skill.projects.join('、')}` : undefined,
    ])).join('\n\n'),
  })

  for (const resource of getInitialResources()) {
    documents.push({
      sourceType: 'static_resource',
      sourceId: resource.id,
      title: resource.name,
      url: resource.url,
      summary: resource.description,
      tags: uniqueTags(['资源', resource.category, ...(resource.tags || [])]),
      isPublic: true,
      content: joinLines([
        `资源：${resource.name}`,
        `链接：${resource.url}`,
        `分类：${resource.category}`,
        resource.description ? `描述：${resource.description}` : undefined,
        resource.tags?.length ? `标签：${resource.tags.join('、')}` : undefined,
      ]),
    })
  }

  for (const post of blogPosts) {
    documents.push({
      sourceType: 'static_resource',
      sourceId: `blog-${post.id}`,
      title: post.title,
      url: post.link,
      summary: post.excerpt,
      tags: uniqueTags(['博客', post.category, ...(post.tags || [])]),
      isPublic: true,
      content: joinLines([
        `文章：${post.title}`,
        `日期：${post.date}`,
        `分类：${post.category}`,
        `摘要：${post.excerpt}`,
        post.tags?.length ? `标签：${post.tags.join('、')}` : undefined,
      ]),
    })
  }

  return documents.filter(document => document.content.trim().length > 0)
}
