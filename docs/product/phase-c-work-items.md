# Phase C 云效工作项拆分

> 日期：2026-06-11  
> 依据：[product-design-optimization.md](./product-design-optimization.md) §7 Phase C  
> 状态：**代码已落地**

---

## Epic：Phase C — 发现与运营

| ID | 标题 | 状态 |
|----|------|------|
| WI-C1 | 公开展柜 `/showcase` | ✅ |
| WI-C2 | 全站搜索 `/search` + 导航入口 | ✅ |
| WI-C3 | 技能 ↔ 项目关联视图 | ✅ |
| WI-C4 | 变更日志 `/changelog` | ✅ |
| WI-C5 | Owner 工作台 `/studio` | ✅ |

---

## 路由一览

| 路径 | 说明 | 入口 |
|------|------|------|
| `/showcase` | 聚合公开项目 / vibe / 知识库 | Footer |
| `/search?q=` | 跨模块搜索 | 顶栏搜索图标 |
| `/changelog` | 庭园志版本记录 | Footer |
| `/studio` | 登录后内容工作台 | Footer |

---

## 自测清单

| # | 场景 | 期望 |
|---|------|------|
| T1 | `/showcase` | 展示 is_public 内容分组 |
| T2 | `/search?q=React` | 返回多来源结果 |
| T3 | 技能卡「关联归档」 | 链接到 `/projects/[slug]` |
| T4 | `/changelog` | 版本列表可读 |
| T5 | `/studio` 未登录 | 显示登录表单 |
| T6 | `/studio` 已登录 | 统计 + 快捷入口 |
