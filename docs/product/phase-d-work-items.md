# Phase D 云效工作项拆分

> 日期：2026-06-11  
> 依据：[product-design-optimization.md](./product-design-optimization.md) §7 Phase D  
> 状态：**代码已落地**（i18n 暂缓）

---

## Epic：Phase D — 探索

| ID | 标题 | 状态 |
|----|------|------|
| WI-D1 | 开放统计页 `/stats` | ✅ |
| WI-D2 | 资源失效检测（API + 工作台） | ✅ |
| WI-D3 | 多语言 `/en` | ⏸ 暂缓（产品文档低优先级） |
| WI-D4 | 知识库同 tag 关联推荐 | ✅ |

---

## 路由与 API

| 路径 | 说明 | 入口 |
|------|------|------|
| `/stats` | 公开内容统计 + 技能分布 + 近月更新 | Footer「庭园度量」 |
| `POST /api/resources/health` | 资源外链 HEAD/GET 探测 | `/studio` 登录后 |

---

## 自测清单

| # | 场景 | 期望 |
|---|------|------|
| T1 | `/stats` | 展示公开内容计数、技能分布、近 6 月热力 |
| T2 | `/studio` 点击「检测资源链接」 | 返回正常/异常汇总；异常列出 URL |
| T3 | 未登录调用 health API | 401 |
| T4 | `/knowledge/[id]` 公开记录有同 tag 项 | 底部「关联记录」可点击 |
| T5 | 无同 tag | 不显示关联区块 |

---

## 暂缓项说明

**WI-D3 i18n**：产品决策为「现阶段中文为主」；待有外企定向需求再立项 `/en` 路由与文案抽取。
