# 静态种子数据

类型与种子数据；运行时业务数据以 Supabase 为准。

| 目录 | 文件 | 用途 |
|------|------|------|
| [site/](./site/) | [personal.ts](./site/personal.ts) | 个人简介、经历、技能、博客（首页 metadata + RAG 静态源） |
| [site/](./site/) | [allProjects.ts](./site/allProjects.ts) | `AllProjectItem` 类型（数据在 Supabase `all_projects`） |
| [resources/](./resources/) | [initialResources.ts](./resources/initialResources.ts) | 资源库种子 + `getInitialResources()`（codegen → SQL） |

生成 resources SQL：`pnpm sql:resources`（见 [scripts/README.md](../../scripts/README.md)）。
