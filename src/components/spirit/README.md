# SpiritGarden 设计系统

跨域复用 UI（home / knowledge / rag 均可引用）。

| 目录 | 组件 | 说明 |
|------|------|------|
| [theme/](./theme/) | `ThemeProvider`、`ThemeToggle` | 明暗主题（根 layout 挂载 Provider） |
| [feedback/](./feedback/) | `ToastProvider`、`DeleteConfirmBar` | 全局 Toast 与内联删除确认 |
| [shell/](./shell/) | `SpiritModalShell`、`SpiritSubpageHero`、`SpiritListCard` | 模态框、子页 Hero、列表卡片 |
| [resource/](./resource/) | `ResourceCard`、`ResourceToolbar` 等 | 资源库页专用展示组件 |

样式 token 与 `sg-*` 类定义于 [app/globals.css](../../app/globals.css)。
