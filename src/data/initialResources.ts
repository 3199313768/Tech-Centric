export interface ResourceItem {
  id: string
  name: string
  url: string
  description?: string
  category: 'learning' | 'ai' | 'other'
  createdAt: number
}

const baseTime = 1700000000000

const initialResourcesData: Omit<ResourceItem, 'createdAt'>[] = [
  // 学习 - 文档与规范
  {
    id: 'mdn',
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/',
    description: 'Web 技术权威文档，HTML/CSS/JS 参考',
    category: 'learning',
  },
  {
    id: 'react-docs',
    name: 'React 官方文档',
    url: 'https://react.dev/',
    description: 'React 官方文档，Hooks、Server Components 等',
    category: 'learning',
  },
  {
    id: 'vue-docs',
    name: 'Vue.js 官方文档',
    url: 'https://cn.vuejs.org/',
    description: 'Vue 3 中文文档',
    category: 'learning',
  },
  {
    id: 'typescript',
    name: 'TypeScript 手册',
    url: 'https://www.typescriptlang.org/docs/',
    description: 'TypeScript 官方文档与手册',
    category: 'learning',
  },
  {
    id: 'nextjs',
    name: 'Next.js 文档',
    url: 'https://nextjs.org/docs',
    description: 'Next.js App Router、SSR、API 等',
    category: 'learning',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com/docs',
    description: 'Tailwind CSS 工具类文档',
    category: 'learning',
  },
  {
    id: 'webdev',
    name: 'web.dev',
    url: 'https://web.dev/',
    description: 'Google 的 Web 开发学习资源',
    category: 'learning',
  },
  {
    id: 'css-tricks',
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com/',
    description: 'CSS 技巧、布局、动画等',
    category: 'learning',
  },
  {
    id: 'caniuse',
    name: 'Can I use',
    url: 'https://caniuse.com/',
    description: '前端 API 与 CSS 兼容性查询',
    category: 'learning',
  },
  {
    id: 'javascript-info',
    name: 'JavaScript.info',
    url: 'https://zh.javascript.info/',
    description: '现代 JavaScript 教程（中文）',
    category: 'learning',
  },
  {
    id: 'freecodecamp',
    name: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/',
    description: '免费编程学习平台',
    category: 'learning',
  },
  {
    id: 'frontend-roadmap',
    name: 'Frontend Roadmap',
    url: 'https://roadmap.sh/frontend',
    description: '前端学习路线图',
    category: 'learning',
  },
  // 进阶 - 源码与规范
  {
    id: 'react-source',
    name: 'React 源码',
    url: 'https://github.com/facebook/react',
    description: 'React 官方仓库，Fiber、调度、并发渲染',
    category: 'learning',
  },
  {
    id: 'tc39',
    name: 'TC39 Proposals',
    url: 'https://github.com/tc39/proposals',
    description: 'ECMAScript 提案与标准演进',
    category: 'learning',
  },
  {
    id: 'ecma262',
    name: 'ECMA-262 规范',
    url: 'https://tc39.es/ecma262/',
    description: 'ECMAScript 语言规范',
    category: 'learning',
  },
  {
    id: 'v8-blog',
    name: 'V8 Blog',
    url: 'https://v8.dev/blog',
    description: 'V8 引擎实现、JIT、GC、优化',
    category: 'learning',
  },
  {
    id: 'whatwg',
    name: 'WHATWG HTML',
    url: 'https://html.spec.whatwg.org/',
    description: 'HTML 标准规范',
    category: 'learning',
  },
  {
    id: 'overreacted',
    name: 'Overreacted',
    url: 'https://overreacted.io/',
    description: 'Dan Abramov 深度解析 React',
    category: 'learning',
  },
  {
    id: 'kentcdodds',
    name: 'Kent C. Dodds',
    url: 'https://kentcdodds.com/blog',
    description: '测试、React、Remix 实践',
    category: 'learning',
  },
  {
    id: 'refactoring-guru',
    name: 'Refactoring Guru',
    url: 'https://refactoring.guru/',
    description: '设计模式、重构、SOLID',
    category: 'learning',
  },
  {
    id: 'system-design',
    name: 'System Design Primer',
    url: 'https://github.com/donnemartin/system-design-primer',
    description: '系统设计、分布式、高可用',
    category: 'learning',
  },
  {
    id: 'nodejs-docs',
    name: 'Node.js 文档',
    url: 'https://nodejs.org/docs/latest/api/',
    description: 'Node.js API、Stream、Event Loop',
    category: 'learning',
  },
  {
    id: 'web-performance',
    name: 'Web Performance',
    url: 'https://web.dev/performance/',
    description: '性能优化、Core Web Vitals、LCP/FID/CLS',
    category: 'learning',
  },
  {
    id: 'chrome-docs',
    name: 'Chrome for Developers',
    url: 'https://developer.chrome.com/',
    description: 'Chrome 渲染、新特性、DevTools',
    category: 'learning',
  },
  // AI
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chat.openai.com/',
    description: 'OpenAI 大语言模型对话',
    category: 'ai',
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/',
    description: 'Anthropic Claude 对话',
    category: 'ai',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    url: 'https://cursor.com/',
    description: 'AI 驱动的代码编辑器',
    category: 'ai',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/',
    description: 'AI 搜索引擎',
    category: 'ai',
  },
  {
    id: 'v0-vercel',
    name: 'v0 by Vercel',
    url: 'https://v0.dev/',
    description: 'AI 生成 React/Next.js UI 组件',
    category: 'ai',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    url: 'https://github.com/features/copilot',
    description: 'GitHub AI 编程助手',
    category: 'ai',
  },
  // AI 进阶
  {
    id: 'openai-api',
    name: 'OpenAI API',
    url: 'https://platform.openai.com/docs',
    description: 'GPT API、Embeddings、Function Calling',
    category: 'ai',
  },
  {
    id: 'anthropic-docs',
    name: 'Anthropic API',
    url: 'https://docs.anthropic.com/',
    description: 'Claude API、长上下文、工具调用',
    category: 'ai',
  },
  {
    id: 'langchain',
    name: 'LangChain',
    url: 'https://python.langchain.com/docs/',
    description: 'LLM 应用框架、RAG、Agent',
    category: 'ai',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    url: 'https://huggingface.co/',
    description: '模型、数据集、Transformers',
    category: 'ai',
  },
  {
    id: 'prompt-engineering',
    name: 'OpenAI Prompt Guide',
    url: 'https://platform.openai.com/docs/guides/prompt-engineering',
    description: 'Prompt 工程最佳实践',
    category: 'ai',
  },
  {
    id: 'swe-agent',
    name: 'SWE-agent',
    url: 'https://github.com/princeton-nlp/SWE-agent',
    description: 'AI 代码修复 Agent',
    category: 'ai',
  },
]

export function getInitialResources(): ResourceItem[] {
  return initialResourcesData.map((item, index) => ({
    ...item,
    createdAt: baseTime + index,
  }))
}
