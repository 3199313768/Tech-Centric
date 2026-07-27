# 归档卡片拖拽排序设计

## 目标

站长可在项目归档页拖拽调整卡片顺序；顺序写入数据库，所有访客看到同一套全局顺序。

## 决策摘要

| 项 | 选择 |
|---|---|
| 持久化 | 数据库（全站一致） |
| 谁可拖 | 仅已登录用户（与 `saveAllProject` 同权） |
| 顺序模型 | 全站一套 `sort_order`；分类 Tab 为过滤子集 |
| UI 库 | `@dnd-kit` |

## 范围

包含：

1. `all_projects.sort_order` 列、回填与查询排序。
2. `reorderAllProjects` server action（鉴权 + 批量写序）。
3. 归档列表 `@dnd-kit` 拖拽（仅登录可见手柄）。
4. 分类筛选下拖拽时「嵌回全局序」的纯函数。
5. 新建项目默认追加到末尾；移除「全部 Tab 公网硬编码置顶」。

不包含：

- 每分类独立顺序
- 访客拖拽或 localStorage 顺序
- 改精选大卡布局规则（仍可用 `isFeatured` 做「全部」bento 位）
- 技能 / 资源等其它列表的拖拽

## 数据模型

- 列：`sort_order integer not null`
- 回填：按当前展示意图一次性赋值（建议：公网优先，其次 `created_at desc`，再赋 `0..n-1`）；之后以拖拽结果为准
- 查询：`order('sort_order', { ascending: true })`
- 新建：`sort_order = coalesce(max(sort_order), -1) + 1`
- 删除：不压缩空隙；比较只依赖数值大小
- 类型：`AllProjectItem.sortOrder: number`；mapper / seed 同步

## 权限与 UI

- `projects/page.tsx` 服务端 `getUser()`，向 `AllProjects` 传 `canReorder: boolean`
- 仅 `canReorder` 时渲染拖动手柄（`aria-label="拖动排序"`）并启用 DnD
- 访客只读，按 `sort_order` 展示
- 依赖：`@dnd-kit/core`、`@dnd-kit/sortable`、`@dnd-kit/utilities`
- 落库失败：toast + 列表回滚；成功可静默或轻量 toast

## 落库与全局序算法

**时机：** `onDragEnd` 且顺序变化 → 乐观更新 → `reorderAllProjects(orderedIds)`。

**「全部」Tab：** 可见列表 = 全量，新顺序即全局 `orderedIds`。

**分类 Tab：** 只改变可见子集相对次序，不可见项占位不动。

示例：全量 `[A,B,C,D,E]`，门户可见 `[B,D]`，拖成 `[D,B]` → 结果 `[A,D,C,B,E]`。

实现为纯函数（建议 `mergeVisibleOrder(fullIds, visibleOrderedIds)`），单测覆盖「全部 / 子集 / 无变化 / 非法 id」。

**Server action：**

1. `requireAuthenticatedUser`
2. 读取当前全部 id 集合；校验 `orderedIds` 与集合完全一致（无增删、无重复）
3. 按 index 写 `sort_order`
4. `revalidatePath` 项目列表与相关路径

## 与精选大卡

- 数据序唯一来源为 `sort_order`
- 「全部」UI 仍可将 `isFeatured` 提到 bento；网格为去掉该条后的剩余序列（现状保留，不引入第二套序）

## 测试与验证

- 单元：`mergeVisibleOrder`、mapper `sortOrder`
- 鉴权：未登录 `reorderAllProjects` 返回错误
- 手动：登录拖「全部」与「门户与展现」、刷新后顺序仍在；访客无手柄
- `pnpm typecheck`、相关 lint、必要 unit test

## 非目标 / 明确排除

- 不按分类存多套 order
- 不保留「全部强制公网置顶」业务规则（由站长拖拽表达）
