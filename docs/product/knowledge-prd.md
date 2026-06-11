# 碎片知识库（Knowledge Base）产品需求报告 (PRD)

> 最后更新：2026-06-11。功能审查见 [knowledge-issues.md](./knowledge-issues.md)。

## 1. 产品定位与目标

- **定位**：集成于个人技术主页的私有化、轻量级碎片知识管理模块。
- **目标**：提供极速的多模态内容（文本、代码、图片、附件）捕获与聚合检索体验。

## 2. 核心功能现状 (As-is)

- **快捷录入 (Quick Capture)**：
  - 全局快捷键 (Cmd+K / Ctrl+Space) 唤起录入弹窗；移动端 `MobileFab` 触发 `open-quick-record`。
  - 支持四种内容类型：笔记 (Text)、代码 (Code)、图片 (Image)、附件 (File)。
  - 支持粘贴图片预览；自定义 Tag 标签输入；多媒体上传至 Supabase Storage，记录落库 `kb_records`。
  - 粘贴与提交前校验文件体积（`KB_MAX_FILE_SIZE`，5MB）。
- **内容消费与检索 (View & Search)**：
  - 响应式瀑布流展示知识卡片；代码语法高亮与一键复制。
  - 全文搜索、内容类型过滤（`RecordTypeTabs`）、标签多维筛选（`TagFilterBar` + URL 参数）。
  - 首屏 50 条 + `RecordList`「加载更多」分页。
- **增删改查 (CRUD)**：
  - 新建：`QuickRecordModal`；编辑：`EditRecordModal`；删除：内联确认 + Server Action。
- **权限管理 (Auth)**：
  - 未登录阻断，经 `LoginForm` 鉴权；RLS 保护私有数据。
- **标签体系**：
  - `lib/knowledge/queries.ts` 分页扫描全库 tags（非 limit(100) 样本）；数据量极大时可改 Supabase RPC 聚合。

## 3. 下一步需求迭代规划 (To-be)

### 3.1 性能与架构 (P1)

- **标签 RPC 聚合**：tags 数据量极大时，由 Supabase RPC 替代客户端分页扫描。

### 3.2 体验增强 (P2)

- **代码语言选择器**：为 code 类型增加显式语言字段（目前依赖 highlight.js 自动推断）。
- **图片优化**：`ProjectReader.tsx` 的 `<img>` 可换 `next/image`。
