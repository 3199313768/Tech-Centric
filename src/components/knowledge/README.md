# 知识库 UI（`/knowledge`）

与 [app/(knowledge)/](../../app/(knowledge)/) 及 [lib/knowledge/](../../lib/knowledge/) 配合使用。

| 目录 | 组件 | 说明 |
|------|------|------|
| [shell/](./shell/) | `KnowledgeNav` | 知识库顶栏 |
| [auth/](./auth/) | `LoginForm` | 未登录阻断页 |
| [browse/](./browse/) | `SearchBar`、`TagFilterBar`、`RecordList`、`RecordCard`、`HighlightThemeLoader` | 列表与筛选 |
| [capture/](./capture/) | `QuickRecordModal`、`EditRecordModal`、`MobileFab` | 录入与编辑（`QuickRecordModal` 在根 layout 全局挂载） |
| [shared/](./shared/) | `TagInput`、`RecordTypeTabs` | 表单/筛选复用控件 |

业务逻辑与 Server Actions 在 `lib/knowledge/`，不在此目录堆叠。
