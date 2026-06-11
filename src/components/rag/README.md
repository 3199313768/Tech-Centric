# RAG 助手 UI

首页右下角浮动助手，仅 UI；检索、生成、索引逻辑在 [lib/rag/](../../lib/rag/)。

| 目录 | 组件 | 说明 |
|------|------|------|
| [shell/](./shell/) | `FloatingAssistant` | 入口按钮 + 面板容器（由 `SiteShell` 动态加载） |
| [chat/](./chat/) | `ChatPanel`、`MessageBubble`、`SuggestedQuestions`、`SourceList` | 问答对话与引用来源 |
| [contact/](./contact/) | `ContactActions`、`ContactSummary` | 联系模式气泡内 UI |

API：`/api/rag/chat`、`/api/rag/reindex`（见 [app/api/rag/](../../app/api/rag/)）。
