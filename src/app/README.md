# App Router

| 路径 | URL | 说明 |
|------|-----|------|
| [layout.tsx](./layout.tsx) | — | 根 layout：字体、主题、Toast、全局 `QuickRecordModal` |
| [(site)/](./(site)/) | `/`、`/projects`、`/skills`、`/vibe`、`/resources` | `SiteShell`（导航 + 首页助手） |
| [(knowledge)/](./(knowledge)/) | `/knowledge` | 知识库独立 shell（`KnowledgeNav`） |
| [api/](./api/) | `/api/*` | Route Handler |

## API

| 目录 | 用途 |
|------|------|
| [api/resources/](./api/resources/) | 资源页：meta 抓取、AI autofill、AI 探索 |
| [api/rag/](./api/rag/) | 公开 RAG 聊天、受保护 reindex |

页面逻辑放 `src/lib/<domain>/`；`page.tsx` 只做编排与 metadata。
