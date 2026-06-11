import type { SuggestedItem } from '@/components/rag/chat/SuggestedQuestions'
import { SITE_ROUTES } from '@/lib/site/routes'

export interface PageRagContext {
  subtitle: string
  welcomeTitle: string
  welcomeText: string
  suggestions: SuggestedItem[]
}

const DEFAULT_SUGGESTIONS: SuggestedItem[] = [
  { id: 'ask-projects', label: '问项目', value: '你做过哪些代表性项目？', type: 'question' },
  { id: 'ask-skills', label: '看技术栈', value: '你的主要技术栈是什么？', type: 'question' },
  { id: 'ask-about', label: '了解园主', value: '介绍一下你的工作经历', type: 'question' },
  { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
]

export function getPageRagContext(pathname: string): PageRagContext {
  if (pathname === SITE_ROUTES.home) {
    return {
      subtitle: '在庭院里，问我项目、经历或资源。',
      welcomeTitle: '你好，欢迎来到数字庭院。',
      welcomeText: '我是导引精灵，可以带你了解园主的作品与技能。',
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  if (pathname.startsWith(SITE_ROUTES.projects)) {
    return {
      subtitle: '正在归档区，可问我项目细节与技术栈。',
      welcomeTitle: '这里是工艺档案室。',
      welcomeText: '想了解某个项目的背景、职责或技术选型，直接问我。',
      suggestions: [
        { id: 'proj-latest', label: '最新项目', value: '介绍一下你最新的项目', type: 'question' },
        { id: 'proj-stack', label: '常用技术', value: '这些项目主要用了哪些技术？', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.skills)) {
    return {
      subtitle: '在技能工坊，可问我技术深度与项目关联。',
      welcomeTitle: '欢迎来到技能工坊。',
      welcomeText: '问我前端、可视化或效能相关的能力边界。',
      suggestions: [
        { id: 'skill-fe', label: '前端能力', value: '你的前端技能强项是什么？', type: 'question' },
        { id: 'skill-exp', label: '项目经验', value: '哪些项目最能体现你的技能？', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.vibe)) {
    return {
      subtitle: '在草本集，可问我实验项目与长文笔记。',
      welcomeTitle: '这里是草本集。',
      welcomeText: '问我 Vibe 实验、灵感笔记或技术长文。',
      suggestions: [
        { id: 'vibe-lab', label: '实验项目', value: '草本集里有哪些 AI 实验？', type: 'question' },
        { id: 'vibe-write', label: '长文输出', value: '有哪些技术长文可以阅读？', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.knowledge)) {
    return {
      subtitle: '在档案馆，可检索公开的知识片段。',
      welcomeTitle: '欢迎来到档案馆。',
      welcomeText: '问我已公开的技术笔记与代码片段（若有索引）。',
      suggestions: [
        { id: 'kb-search', label: '知识检索', value: '知识库里有关于 React 的内容吗？', type: 'question' },
        { id: 'ask-resources', label: '资源推荐', value: '有什么前端学习资源推荐？', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.about)) {
    return {
      subtitle: '在园主页，可问我履历与合作方式。',
      welcomeTitle: '想了解园主？',
      welcomeText: '问我工作经历、能力矩阵或联系方式。',
      suggestions: [
        { id: 'about-exp', label: '工作经历', value: '介绍一下你的工作经历', type: 'question' },
        { id: 'about-contact', label: '如何联系', value: '怎么联系你？', type: 'question' },
        { id: 'contact', label: '写邮件', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.resources)) {
    return {
      subtitle: '在资源架，可问我推荐的学习资料。',
      welcomeTitle: '这里是资源架。',
      welcomeText: '问我前端、设计或 AI 相关的 curated 资源。',
      suggestions: [
        { id: 'res-fe', label: '前端资源', value: '有什么前端学习资源推荐？', type: 'question' },
        { id: 'res-ai', label: 'AI 工具', value: '你常用哪些 AI 开发工具？', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.showcase)) {
    return {
      subtitle: '在公开展柜，浏览可对外展示的内容。',
      welcomeTitle: '这里是庭院展柜。',
      welcomeText: '问我公开展示的项目、长文或知识片段。',
      suggestions: [
        { id: 'showcase-proj', label: '公开项目', value: '有哪些公开项目？', type: 'question' },
        { id: 'showcase-write', label: '技术长文', value: '推荐一篇技术长文', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  if (pathname.startsWith(SITE_ROUTES.search)) {
    return {
      subtitle: '在全站搜索，也可直接问我。',
      welcomeTitle: '没找到想要的？',
      welcomeText: '输入关键词搜索，或让我帮你检索站内资料。',
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  if (pathname.startsWith(SITE_ROUTES.stats)) {
    return {
      subtitle: '在庭园度量，了解站点公开内容规模。',
      welcomeTitle: '这里是开放数据页。',
      welcomeText: '问我站点有哪些公开项目、技能或知识片段。',
      suggestions: [
        { id: 'stats-proj', label: '公开项目', value: '有多少公开项目？', type: 'question' },
        { id: 'stats-skill', label: '技能分布', value: '你的 Agent Skills 有哪些平台？', type: 'question' },
        { id: 'contact', label: '联系我', value: 'start-contact', type: 'action' },
      ],
    }
  }

  return {
    subtitle: '基于站内资料检索，也可以直接联系我。',
    welcomeTitle: '你好，我是庭院的导引精灵。',
    welcomeText: '可以问我站长的项目、技术栈、经历，也可以直接联系我。',
    suggestions: DEFAULT_SUGGESTIONS,
  }
}
