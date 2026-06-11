# Tech-Centric Agent Guide

完整规范见 [docs/engineering/前端代码规范.md](docs/engineering/前端代码规范.md)，分三档：

| 档位 | 内容 | 强制 |
|------|------|------|
| **Part A 中级基线** | TS/React/错误/风格/质量门禁 | 必须 |
| **Part B 高级专题** | 缓存、Suspense、乐观更新、虚拟化、API 安全 | 场景触发 |
| **Part C 项目定制** | SpiritGarden、Supabase、目录、历史债 | 必须 |

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Next.js 16 App Router、React 19 |
| 样式 | Tailwind CSS 4 + SpiritGarden（`sg-*` + CSS 变量） |
| 主题 | next-themes（class 策略） |
| 数据 | Supabase（`@supabase/ssr`） |
| 编译 | React Compiler 已开启 |
| 路径别名 | `@/*` → `src/*` |

## 目录约定

```
src/app/                    → 路由（见 src/app/README.md）
src/app/(site)/             → /、/projects、/skills、/vibe、/resources
src/app/(knowledge)/        → /knowledge
src/app/api/resources/      → 资源页 AI 辅助 API
src/app/api/rag/            → RAG chat / reindex
src/components/home/        → `(site)` 页面 UI（见 components/home/README.md）
src/components/knowledge/ → 知识库 UI（见 components/knowledge/README.md）
src/components/rag/       → AI 助手 UI（见 components/rag/README.md）
src/components/spirit/    → 设计系统（见 components/spirit/README.md）
src/lib/knowledge/        → types.ts、queries.ts
src/lib/rag/              → RAG 逻辑 + contactFlow.ts
src/lib/supabase/         → server / client
src/data/                 → 静态种子（见 data/README.md：site/、resources/）
src/utils/                → 纯函数 + hooks
```

- 导入统一 `@/`；非 UI 逻辑不进 `components/`
- 页面逻辑 → `lib/<domain>/`，不在 `page.tsx` 堆 200+ 行

## 必须遵守（10 条红线）

1. **最小改动**：只改任务相关文件
2. **类型安全**：禁止 `any`、无说明 `@ts-ignore`
3. **Server 优先**：默认 Server Component；hooks/浏览器 API 才 `'use client'`
4. **禁止 alert**：error state + `sg-*-error` 或 fallback
5. **Supabase 分端**：Server → `@/lib/supabase/server`，Client → `client`
6. **处理 error**：`{ data, error }` 必须分支处理
7. **样式 token**：优先 `sg-*`；颜色 `var(--sg-*)`；禁止 hex
8. **分页列表**：禁止无 UI 的 `.limit(N)`
9. **a11y**：`aria-label` / `htmlFor` / 可见文本
10. **安全**：密钥不进客户端；Markdown 用 `react-markdown`

## Part C 速查（项目定制）

```tsx
// 样式
<button className="sg-btn sg-btn--primary" />
<div className="sg-kb-error sg-kb-error--inline">{error}</div>
<div className="spirit-garden-content sg-subpage sg-subpage--archive">

// Supabase
import { createClient } from '@/lib/supabase/server'  // Server
import { createClient } from '@/lib/supabase/client'   // Client

// 命名：KbRecord（不用 I 前缀）
```

## Part B 触发条件

| 任务 | 查阅 |
|------|------|
| mutation 后列表不刷新 | B1 缓存失效 |
| 页面 TTFB 慢 | B2 Suspense 拆分 |
| 删除/切换需即时反馈 | B3 乐观更新 |
| 列表 > 50 条 | B4 分页/虚拟化 |
| 新增/改 API | B5 Route Handler 安全 |
| 包体积/重组件 | B6 dynamic import |

## 改旧代码

- 新代码：Part A + Part C 必守；触发场景加 Part B
- 改旧文件：仅修正触达区域
- 历史偏离：[Part C4 已知偏离项](docs/engineering/前端代码规范.md#c4-已知偏离项历史债)

## 本地验证

```bash
pnpm lint && pnpm typecheck && pnpm build
```

## 完整规范

→ [docs/engineering/前端代码规范.md](docs/engineering/前端代码规范.md) · 文档索引：[docs/README.md](docs/README.md) · Cursor 规则：`.cursor/rules/`
