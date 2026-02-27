# Tech-Centric

个人技术主页，杂志式布局 + 物理引擎封面。

## 功能模块

| 模块 | 说明 |
|------|------|
| 首页 | Hero 物理世界、关于我、技能、经历、作品集、统计、成就 |
| AI Skills | Agent Skills 集合（自动提交、周报生成、代码审计等） |
| Vibe Coding | AI 辅助快速迭代的个人项目（AI思维圆桌、每日简报等） |
| 年度回顾 | 年度总结与回顾 |
| 旅行 | 旅行地图 |
| 联系 | 聊天气泡式对话，通过 mailto 发送 |

## 技术栈

- **框架**: Next.js 16 (App Router)、React 19
- **样式**: Tailwind CSS 4、CSS 变量（明暗主题）
- **动画**: Framer Motion、GSAP、Matter.js（物理引擎）
- **主题**: next-themes

## 开发

```bash
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000)。

## 构建

```bash
yarn build
yarn start
```

## 项目结构

```
src/
├── app/           # 页面与布局
├── components/    # 组件
├── data/          # 个人数据（personal.ts、projects.ts）
├── utils/         # 工具函数
docs/              # 文档
```

## 部署

支持 Vercel 一键部署。
