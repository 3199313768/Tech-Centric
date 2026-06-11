export interface ChangelogEntry {
  version: string
  date: string
  title: string
  items: string[]
}

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: '0.3.0',
    date: '2026-06-11',
    title: 'Phase B — 内容深度',
    items: [
      '草本集合并长文：kind / slug / body，路由 /vibe/[slug]',
      '知识库公开详情 /knowledge/[id]',
      'RAG 情境欢迎语与来源深链',
      '项目首页精选 is_featured 管理',
    ],
  },
  {
    version: '0.2.0',
    date: '2026-06-11',
    title: 'Phase A — 信任与转化',
    items: [
      '园主页 /about 与顶栏「园主」',
      '全站 Footer 明文邮箱',
      '项目详情 /projects/[slug]',
      '知识库 is_public 公开策略',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-09',
    title: 'SpiritGarden 基线',
    items: [
      'UI 创意优化：氛围层、子页场景化、全站助手',
      '知识库 MVP 与 RAG 公开助手',
      '子页 CRUD：归档 / 技能工坊 / 草本集 / 资源',
    ],
  },
]
