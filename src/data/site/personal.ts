export interface PersonalInfo {
  name: string
  title: string
  bio: string[]
  skills: string[]
  socialLinks: {
    github?: string
    linkedin?: string
    email?: string
    twitter?: string
    website?: string
  }
  cta: {
    primary: {
      text: string
      action: string
    }
    secondary?: {
      text: string
      action: string
    }
  }
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  period: string
  location?: string
  description: string
  achievements: string[]
  technologies: string[]
}

export interface SkillDetail {
  name: string
  category: 'frontend' | 'backend' | 'tools' | 'other'
  proficiency: number // 0-100
  yearsOfExperience?: number
  projects?: string[]
}

export const personalInfo: PersonalInfo = {
  name: '杨倩 - Oxygen',
  title: '高级前端工程师 · 水利孪生 · 效能驱动',
  bio: [
    '专注于 React/Next.js 和交互设计，用代码创造流畅的用户体验',
    '热爱动画与性能优化，追求技术与美学的平衡',
    '相信代码不仅是功能，更是艺术与体验的融合',
  ],
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Next.js',
    'Vue.js',
    'Python',
    'PostgreSQL',
    'Docker',
  ],
  socialLinks: {
    github: 'https://github.com/3199313768/Tech-Centric',
    email: 'mailto:3199313768@qq.com',
  },
  cta: {
    primary: {
      text: '查看作品',
      action: '#projects',
    },
    secondary: {
      text: '联系我',
      action: 'mailto:3199313768@qq.com',
    },
  },
}

export const workExperience: WorkExperience[] = [
  {
    id: '1',
    company: '浙江远算科技有限公司',
    position: '前端开发工程师 / PMO助理',
    period: '2024.07 - 至今',
    location: '杭州',
    description: '负责水利数字孪生及工业软件线的前端开发，兼任部门PMO助理，推动研发效能提升，承担新人带教工作',
    achievements: [
      '高并发项目调度：1年内主导/支撑 13 个水利相关项目，通过抽离"水利一张图"、"预警看板"等原子级业务组件，实现关键节点 100% 准时交付。',
      '效能驾驶舱：从0到1设计并开发《部门效能驾驶舱大屏》，实时可视化项目进度、代码量及测试状态，通过数据驱动资源分配，显著降低资源冲突率。',
      '流程标准化：编写《交付部工作手册》，统一 Git 提交规范与 API 协作流程，填补部门文档空白。',
      '新人带教：负责2名新入职前端工程师的带教工作，制定针对性学习计划，指导项目实操，帮助新人快速上手。',
      '荣誉：获评公司"月度之星"，年度绩效 B+（Top 5%）。',
    ],
    technologies: ['React', 'TypeScript', '数字孪生', '大屏可视化'],
  },
  {
    id: '2',
    company: '杭州融先科技有限公司',
    position: '前端开发工程师',
    period: '2022.07 - 2024.04',
    location: '杭州',
    description: '负责金融证券类资管云系统开发，主攻数据密集型页面与复杂交互逻辑。',
    achievements: [
      '资管云核心组件库：针对金融报表场景，封装高性能虚拟列表，彻底解决长列表卡顿问题。',
      '动态权限架构：基于 React-Router 路由钩子重构系统权限体系，实现从菜单到按钮（Button-Level）的细粒度控制，统一了全站路由交互规范。',
      '提效成果：结合业务 UI 规范深度封装通用样式组件，编写前端流程文档，将业务模块开发效率提升 30%。',
    ],
    technologies: ['React', 'React-Router', 'TypeScript', '虚拟列表'],
  },
]

export const skillsDetail: SkillDetail[] = [
  { name: 'React', category: 'frontend', proficiency: 90, yearsOfExperience: 4, projects: ['E-Commerce Platform', 'Dashboard UI'] },
  { name: 'TypeScript', category: 'frontend', proficiency: 85, yearsOfExperience: 3, projects: ['E-Commerce Platform', 'Component Library'] },
  { name: 'Next.js', category: 'frontend', proficiency: 80, yearsOfExperience: 2, projects: ['Dashboard UI'] },
  { name: 'Vue.js', category: 'frontend', proficiency: 75, yearsOfExperience: 2, projects: ['Task Manager', 'Admin Panel'] },
  { name: 'Node.js', category: 'backend', proficiency: 85, yearsOfExperience: 4, projects: ['API Gateway', 'WebSocket Server'] },
  { name: 'Python', category: 'backend', proficiency: 70, yearsOfExperience: 2, projects: ['Database ORM'] },
  { name: 'PostgreSQL', category: 'backend', proficiency: 75, yearsOfExperience: 3 },
  { name: 'MongoDB', category: 'backend', proficiency: 70, yearsOfExperience: 2 },
  { name: 'Docker', category: 'tools', proficiency: 80, yearsOfExperience: 3 },
  { name: 'Git', category: 'tools', proficiency: 90, yearsOfExperience: 5 },
  { name: 'AWS', category: 'tools', proficiency: 65, yearsOfExperience: 2 },
]

