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

export interface Education {
  school: string
  degree: string
  major: string
  period: string
  description?: string
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

export interface Stat {
  label: string
  value: number
  unit?: string
  icon?: string
}

export interface BlogPost {
  id: string
  title: string
  date: string
  category: string
  excerpt: string
  link: string
  tags?: string[]
}

export interface Achievement {
  id: string
  title: string
  type: 'award' | 'certification' | 'contribution'
  date: string
  issuer?: string
  description: string
  image?: string
  link?: string
}

export const personalInfo: PersonalInfo = {
  name: '杨倩 - Oxygen',
  title: 'Frontend Developer',
  bio: [
    '专注于 React/Next.js 和交互设计，用代码创造流畅的用户体验',
    '热爱动画与性能优化，追求技术与美学的平衡',
    '相信代码不仅是功能，更是艺术与体验的融合'
  ],
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Next.js',
    'Vue.js',
    'Python',
    'PostgreSQL',
    'Docker'
  ],
  socialLinks: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
    email: 'mailto:3199313768@qq.com',
    twitter: 'https://twitter.com/yourusername'
  },
  cta: {
    primary: {
      text: '查看作品',
      action: '#projects'
    },
    secondary: {
      text: '联系我',
      action: 'mailto:3199313768@qq.com'
    }
  }
}

export const aboutInfo = {
  detailedBio: [
    '我是一名前端开发工程师，拥有3-5年的Web开发经验，专注于React/Next.js生态系统。从最初接触前端开发开始，就被代码与视觉结合的魅力所吸引，逐渐在技术深度和设计美感之间找到了平衡。',
    '在项目实践中，我不仅关注功能的实现，更注重用户体验的细节。通过性能优化、动画交互和组件库开发，我学会了如何用技术手段提升产品的视觉表现力和交互流畅度。每一个微交互、每一次性能提升，都是技术与艺术的完美结合。',
    '设计思维一直是我工作的核心驱动力。我相信好的前端开发不仅仅是写代码，更是理解用户需求、把握视觉节奏、创造情感连接的过程。无论是构建UI组件库，还是优化页面性能，我都力求在技术实现和美学表达之间找到最佳平衡点。',
    '技术世界日新月异，保持学习是我一直坚持的习惯。从React Hooks到Next.js App Router，从CSS动画到WebGL，我不断探索新的技术边界。同时，我也喜欢通过技术博客和开源项目分享自己的学习心得，与社区一起成长。',
    'Oxygen（氧气）是我的个人标识，它代表着我希望代码能够像氧气一样，让产品"呼吸"得更自然、更流畅。在代码之外，我也热爱生活中的美好事物——无论是手冲咖啡的仪式感，还是探索新城市的未知，这些经历都让我对设计和体验有了更深的理解。'
  ],
  values: [
    {
      title: '技术追求',
      description: '专注于性能优化和代码质量，用技术手段提升产品体验'
    },
    {
      title: '设计思维',
      description: '将用户体验和视觉美感融入每一个开发决策中'
    },
    {
      title: '持续学习',
      description: '保持好奇心，探索新技术，通过分享与社区共同成长'
    },
    {
      title: '创意表达',
      description: '在技术与艺术之间寻找平衡，让代码充满生命力'
    }
  ]
}

export const education: Education[] = [
  {
    school: '本科院校',
    degree: '学士学位',
    major: '计算机相关专业',
    period: '2018 - 2022',
    description: '主修计算机相关专业，在校期间开始接触前端开发，专注于Web技术和用户体验设计'
  }
]

export const workExperience: WorkExperience[] = [
  {
    id: '1',
    company: '科技公司A',
    position: '高级全栈工程师',
    period: '2021 - 至今',
    location: '北京',
    description: '负责核心产品的开发和架构设计',
    achievements: [
      '主导重构了核心系统，性能提升40%',
      '建立了代码审查和CI/CD流程',
      '指导团队成员，提升团队整体技术水平'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']
  },
  {
    id: '2',
    company: '创业公司B',
    position: '全栈工程师',
    period: '2019 - 2021',
    location: '上海',
    description: '参与产品从0到1的开发过程',
    achievements: [
      '开发了核心功能模块',
      '优化了数据库查询性能',
      '实现了实时通信功能'
    ],
    technologies: ['Vue.js', 'Python', 'MongoDB', 'WebSocket']
  }
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
  { name: 'AWS', category: 'tools', proficiency: 65, yearsOfExperience: 2 }
]

export const stats: Stat[] = [
  { label: 'GitHub 贡献', value: 1200, unit: '次' },
  { label: '项目数量', value: 25, unit: '个' },
  { label: '代码提交', value: 850, unit: '次' },
  { label: '代码行数', value: 50000, unit: '行' }
]

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'React性能优化最佳实践',
    date: '2024-01-15',
    category: '前端开发',
    excerpt: '深入探讨React应用性能优化的各种技巧和策略...',
    link: '#',
    tags: ['React', '性能优化', '前端']
  },
  {
    id: '2',
    title: 'TypeScript高级类型系统',
    date: '2024-01-10',
    category: 'TypeScript',
    excerpt: '学习TypeScript的高级类型特性，提升代码质量...',
    link: '#',
    tags: ['TypeScript', '类型系统']
  },
  {
    id: '3',
    title: '微服务架构设计思考',
    date: '2024-01-05',
    category: '架构设计',
    excerpt: '分享微服务架构设计中的经验和教训...',
    link: '#',
    tags: ['微服务', '架构', '后端']
  }
]

export const achievements: Achievement[] = [
  {
    id: '1',
    title: '优秀开源贡献者',
    type: 'award',
    date: '2023-12',
    issuer: 'GitHub',
    description: '在开源社区做出突出贡献',
    link: 'https://github.com'
  },
  {
    id: '2',
    title: 'AWS认证解决方案架构师',
    type: 'certification',
    date: '2023-06',
    issuer: 'Amazon Web Services',
    description: '通过AWS解决方案架构师认证考试',
    link: '#'
  },
  {
    id: '3',
    title: 'React核心库贡献',
    type: 'contribution',
    date: '2023-03',
    issuer: 'React Team',
    description: '为React核心库提交了重要的bug修复',
    link: '#'
  }
]

// 日常随笔 / 生活日志
export interface LifeLog {
  id: string
  date: string
  title: string
  content: string
  tags: string[]
  image?: string
}

export const lifeLogs: LifeLog[] = [
  {
    id: '1',
    date: '2024-02-01',
    title: '清晨的咖啡时光',
    content: '今天早上起得特别早，泡了一杯手冲咖啡。看着咖啡液慢慢滴下，突然觉得生活需要这样的慢节奏。有时候，停下来感受当下，比一直往前冲更重要。',
    tags: ['生活', '思考', '咖啡']
  },
  {
    id: '2',
    date: '2024-01-28',
    title: '读完《深度工作》',
    content: '终于读完了这本一直想看的书。最大的收获是理解了专注力的重要性。在这个信息爆炸的时代，能够深度专注地工作，是一种稀缺的能力。决定从明天开始，每天至少保持2小时的深度工作时间。',
    tags: ['读书', '成长', '工作']
  },
  {
    id: '3',
    date: '2024-01-25',
    title: '周末的公园漫步',
    content: '周末去了附近的公园，看到了很多人在跑步、遛狗、晒太阳。突然意识到，生活不只有代码和工作，还有这些简单而美好的时刻。决定以后每周至少抽出半天时间，去户外走走。',
    tags: ['生活', '运动', '周末']
  },
  {
    id: '4',
    date: '2024-01-20',
    title: '学习新框架的思考',
    content: '最近在学习一个新的前端框架，发现学习曲线比想象中陡峭。但每次解决一个问题，都有一种成就感。也许这就是编程的魅力所在——永远有新的东西可以学习，永远有挑战等着你。',
    tags: ['技术', '学习', '思考']
  },
  {
    id: '5',
    date: '2024-01-15',
    title: '和朋友的小聚',
    content: '今天和几个老朋友聚了聚，聊了很多。发现大家虽然走的路不同，但都在各自的领域努力着。这种互相鼓励的感觉真好。友情需要维护，不能因为工作忙就忽略了。',
    tags: ['友情', '生活', '社交']
  }
]

// 年度回顾 / 时间轴
export interface YearlyReview {
  id: string
  year: number
  title: string
  description: string
  highlights: string[]
  image?: string
}

export const yearlyReviews: YearlyReview[] = [
  {
    id: '1',
    year: 2024,
    title: '2024年度回顾',
    description: '这是充满挑战和成长的一年，在技术、生活和工作各个方面都有了新的突破。',
    highlights: [
      '完成了3个重要项目的开发',
      '学习了Next.js和TypeScript的高级特性',
      '开始写技术博客，分享了10+篇文章',
      '参加了2次技术大会',
      '养成了每天阅读的习惯',
      '完成了第一次马拉松'
    ]
  },
  {
    id: '2',
    year: 2023,
    title: '2023年度回顾',
    description: '这一年是转型的一年，从后端开发转向全栈，接触了很多新技术。',
    highlights: [
      '掌握了React和Vue.js框架',
      '完成了第一个开源项目',
      '获得了AWS认证',
      '开始学习设计思维',
      '旅行了5个城市',
      '读完了30本书'
    ]
  },
  {
    id: '3',
    year: 2022,
    title: '2022年度回顾',
    description: '专注于后端技术深度，在系统架构和性能优化方面有了很大提升。',
    highlights: [
      '深入学习了微服务架构',
      '优化了公司核心系统性能',
      '指导了3名初级开发者',
      '开始学习前端技术',
      '建立了个人网站',
      '养成了健身的习惯'
    ]
  }
]

// 推荐清单
export interface Recommendation {
  id: string
  type: 'book' | 'movie' | 'tool' | 'music' | 'other'
  title: string
  description: string
  rating: number // 1-5
  link?: string
  image?: string
  tags?: string[]
}

export const recommendations: Recommendation[] = [
  {
    id: '1',
    type: 'book',
    title: '《深度工作》',
    description: '一本关于如何提高专注力和工作效率的书。作者提出了很多实用的方法，帮助我在工作中更好地保持专注。',
    rating: 5,
    link: 'https://example.com',
    tags: ['效率', '工作', '专注力']
  },
  {
    id: '2',
    type: 'book',
    title: '《设计模式》',
    description: '经典的设计模式书籍，对于理解软件架构和代码组织非常有帮助。虽然有些模式现在可能不太常用，但思想依然有价值。',
    rating: 4,
    tags: ['编程', '架构', '设计']
  },
  {
    id: '3',
    type: 'movie',
    title: '《星际穿越》',
    description: '诺兰的科幻巨作，每次看都有新的感受。不仅仅是视觉震撼，更是对时间、爱和人类未来的深刻思考。',
    rating: 5,
    tags: ['科幻', '哲学', '情感']
  },
  {
    id: '4',
    type: 'movie',
    title: '《千与千寻》',
    description: '宫崎骏的经典作品，每次看都能找到新的细节。动画不仅仅是给孩子的，成年人也能从中获得很多启发。',
    rating: 5,
    tags: ['动画', '成长', '奇幻']
  },
  {
    id: '5',
    type: 'tool',
    title: 'VS Code',
    description: '最爱的代码编辑器，插件生态丰富，自定义程度高。配合各种插件，可以打造最适合自己的开发环境。',
    rating: 5,
    link: 'https://code.visualstudio.com',
    tags: ['开发工具', '编辑器']
  },
  {
    id: '6',
    type: 'tool',
    title: 'Notion',
    description: '全能的笔记和项目管理工具。我用它来管理待办事项、写笔记、记录想法。界面简洁，功能强大。',
    rating: 5,
    link: 'https://notion.so',
    tags: ['笔记', '管理', '工具']
  },
  {
    id: '7',
    type: 'music',
    title: '《Blinding Lights》',
    description: 'The Weeknd的经典作品，节奏感强，适合编程时听。这首歌总能让我保持专注和动力。',
    rating: 5,
    tags: ['流行', '电子']
  },
  {
    id: '8',
    type: 'other',
    title: '手冲咖啡',
    description: '最近迷上了手冲咖啡。从选豆、磨豆到冲煮，每一步都需要专注。这个过程让我学会了慢下来，享受当下。',
    rating: 5,
    tags: ['生活', '爱好', '咖啡']
  }
]

// 旅行地图
export interface TravelLocation {
  id: string
  name: string
  location: string
  coordinates: {
    lat: number
    lng: number
  }
  date: string
  description: string
  image?: string
  tags?: string[]
}

export const travelLocations: TravelLocation[] = [
  {
    id: '1',
    name: '北京',
    location: '中国北京',
    coordinates: { lat: 39.9042, lng: 116.4074 },
    date: '2024-01-15',
    description: '第一次去北京，参观了故宫和天安门。感受到了浓厚的历史文化氛围。北京的胡同文化也很有意思，走在小巷里，仿佛穿越了时空。',
    tags: ['历史', '文化', '城市']
  },
  {
    id: '2',
    name: '杭州',
    location: '中国浙江',
    coordinates: { lat: 30.2741, lng: 120.1551 },
    date: '2023-12-10',
    description: '西湖的美景让人流连忘返。在湖边散步，看着夕阳西下，心情特别平静。杭州的茶文化也很浓厚，品尝了正宗的龙井茶。',
    tags: ['自然', '文化', '休闲']
  },
  {
    id: '3',
    name: '成都',
    location: '中国四川',
    coordinates: { lat: 30.6624, lng: 104.0633 },
    date: '2023-11-20',
    description: '成都的美食真的名不虚传！火锅、串串、担担面，每一样都让人回味无穷。还去了大熊猫基地，看到了可爱的熊猫。',
    tags: ['美食', '自然', '城市']
  },
  {
    id: '4',
    name: '厦门',
    location: '中国福建',
    coordinates: { lat: 24.4798, lng: 118.0819 },
    date: '2023-10-05',
    description: '厦门的海风很舒服，鼓浪屿的小巷很有特色。在海边看日出，那种感觉真的很治愈。厦门的海鲜也很新鲜，值得一试。',
    tags: ['海边', '自然', '美食']
  },
  {
    id: '5',
    name: '西安',
    location: '中国陕西',
    coordinates: { lat: 34.3416, lng: 108.9398 },
    date: '2023-09-15',
    description: '参观了兵马俑，被古代工匠的技艺震撼到了。西安的古城墙也很壮观，骑自行车绕城墙一圈，看到了城市的全貌。',
    tags: ['历史', '文化', '古迹']
  }
]
