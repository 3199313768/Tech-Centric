export type ProjectType = 'React' | 'Vue' | 'Node'

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

export const projects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    type: 'React',
    description: 'A modern e-commerce platform built with React and TypeScript',
    detailedDescription: '一个功能完整的电商平台，包含商品展示、购物车、订单管理、支付集成等功能。采用现代化的技术栈，确保高性能和良好的用户体验。',
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Stripe'],
    highlights: ['响应式设计', '支付集成', '实时库存管理', '用户评价系统'],
    status: 'completed',
    startDate: '2023-01',
    endDate: '2023-06',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/ecommerce'
  },
  {
    id: '2',
    title: 'Task Manager',
    type: 'Vue',
    description: 'A collaborative task management application',
    detailedDescription: '协作式任务管理应用，支持团队协作、任务分配、进度跟踪等功能。',
    technologies: ['Vue.js', 'Vuex', 'Firebase', 'Vuetify'],
    highlights: ['实时协作', '任务看板', '通知系统', '数据可视化'],
    status: 'completed',
    startDate: '2023-03',
    endDate: '2023-08',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/taskmanager'
  },
  {
    id: '3',
    title: 'API Gateway',
    type: 'Node',
    description: 'Microservices API gateway with rate limiting',
    detailedDescription: '微服务API网关，提供统一入口、限流、认证、监控等功能。',
    technologies: ['Node.js', 'Express', 'Redis', 'Docker', 'Kubernetes'],
    highlights: ['限流保护', '负载均衡', 'API监控', '自动扩缩容'],
    status: 'completed',
    startDate: '2022-09',
    endDate: '2023-02',
    githubUrl: 'https://github.com/example/apigateway'
  },
  {
    id: '4',
    title: 'Dashboard UI',
    type: 'React',
    description: 'Real-time analytics dashboard',
    detailedDescription: '实时数据分析仪表板，提供数据可视化、报表生成等功能。',
    technologies: ['React', 'D3.js', 'WebSocket', 'Chart.js'],
    highlights: ['实时数据', '多种图表', '数据导出', '自定义报表'],
    status: 'completed',
    startDate: '2023-05',
    endDate: '2023-09',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/dashboard'
  },
  {
    id: '5',
    title: 'Admin Panel',
    type: 'Vue',
    description: 'Comprehensive admin panel with role-based access',
    detailedDescription: '功能完善的管理后台，支持角色权限管理、数据管理等功能。',
    technologies: ['Vue.js', 'Element UI', 'Node.js', 'PostgreSQL'],
    highlights: ['权限管理', '数据CRUD', '批量操作', '操作日志'],
    status: 'completed',
    startDate: '2022-11',
    endDate: '2023-04',
    githubUrl: 'https://github.com/example/admin'
  },
  {
    id: '6',
    title: 'WebSocket Server',
    type: 'Node',
    description: 'Real-time communication server',
    detailedDescription: '基于WebSocket的实时通信服务器，支持多房间、消息推送等功能。',
    technologies: ['Node.js', 'Socket.io', 'Redis', 'MongoDB'],
    highlights: ['实时通信', '房间管理', '消息持久化', '高并发支持'],
    status: 'completed',
    startDate: '2023-01',
    endDate: '2023-05',
    githubUrl: 'https://github.com/example/websocket'
  },
  {
    id: '7',
    title: 'Component Library',
    type: 'React',
    description: 'Reusable React component library',
    detailedDescription: '可复用的React组件库，包含常用UI组件，支持主题定制。',
    technologies: ['React', 'TypeScript', 'Storybook', 'Jest'],
    highlights: ['30+组件', 'TypeScript支持', '主题定制', '完整文档'],
    status: 'completed',
    startDate: '2023-06',
    endDate: '2023-10',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/components'
  },
  {
    id: '8',
    title: 'SPA Framework',
    type: 'Vue',
    description: 'Custom single-page application framework',
    detailedDescription: '自定义单页应用框架，提供路由、状态管理等核心功能。',
    technologies: ['Vue.js', 'TypeScript', 'Webpack', 'Vite'],
    highlights: ['轻量级', 'TypeScript支持', '插件系统', '开发工具'],
    status: 'in-progress',
    startDate: '2023-11',
    githubUrl: 'https://github.com/example/spa-framework'
  },
  {
    id: '9',
    title: 'Database ORM',
    type: 'Node',
    description: 'Type-safe database ORM for Node.js',
    detailedDescription: '类型安全的Node.js数据库ORM，支持多种数据库，提供流畅的API。',
    technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'MySQL'],
    highlights: ['类型安全', '多数据库支持', '迁移工具', '查询构建器'],
    status: 'completed',
    startDate: '2022-12',
    endDate: '2023-07',
    githubUrl: 'https://github.com/example/orm'
  },
  {
    id: '10',
    title: 'Animation Engine',
    type: 'React',
    description: 'High-performance animation library',
    detailedDescription: '高性能动画库，提供流畅的动画效果和丰富的动画API。',
    technologies: ['React', 'TypeScript', 'Web Animations API', 'GSAP'],
    highlights: ['高性能', '60fps', '丰富API', '易于使用'],
    status: 'completed',
    startDate: '2023-04',
    endDate: '2023-08',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/animation'
  }
]