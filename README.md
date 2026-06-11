# Tech-Centric

个人技术主页，杂志式布局 + WebGL 粒子封面。

## 技术栈
- **AI 框架**：OpenAI   
- **数据库**：supabase
- **部署**：Vercel
- **框架**：Next.js 16 (App Router)、React 19
- **样式**：Tailwind CSS 4、CSS 变量（明暗主题）
- **动画**：Framer Motion、WebGL（SpiritDustCanvas）
- **主题**: next-themes

## 开发

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)。


## 项目结构

```
src/
├── app/
│   ├── (site)/           # 首页与子页（/、/projects、/skills…）
│   ├── (knowledge)/      # 知识库 /knowledge
│   └── api/
│       ├── resources/    # 资源页 AI 辅助
│       └── rag/          # 公开助手
├── components/
│   ├── home/             # (site) 页面 UI（shell / landing / projects…）
│   ├── knowledge/        # 知识库 UI（shell / browse / capture…）
│   ├── rag/              # AI 助手 UI（shell / chat / contact）
│   └── spirit/           # 设计系统（theme / feedback / shell / resource）
├── lib/
│   ├── knowledge/        # 知识库 types、queries
│   ├── rag/              # RAG 逻辑
│   ├── site/             # 站点路由常量
│   └── supabase/
├── data/                 # 静态种子（site/、resources/，见 data/README.md）
└── utils/                # 工具函数与 hooks
docs/                     # 文档（索引见 docs/README.md）
scripts/                  # 维护脚本与 Supabase SQL（见 scripts/README.md）
```

## 前端代码规范

人类开发者与 AI 编码均遵循 [docs/engineering/前端代码规范.md](docs/engineering/前端代码规范.md)（中级基线 / 高级专题 / 项目定制三档）。文档索引见 [docs/README.md](docs/README.md)。AI 入口见 [AGENTS.md](AGENTS.md)，Cursor 自动规则见 [.cursor/rules/](.cursor/rules/)。

本地验证：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## 部署

支持 Vercel 一键部署。

## RAG AI 助手

首页右下角的公开 AI 助手使用站内资料和公开知识库记录进行 RAG 问答。

### 环境变量

```bash
OPENAI_API_KEY=your_openai_api_key
# 默认 https://api.openai.com/v1，可不写
OPENAI_BASE_URL=https://api.openai.com/v1
# 国内无法直连时，配置本机代理（Clash 等），Node 不会自动走系统代理
HTTPS_PROXY=http://127.0.0.1:7890
EMBEDDING_MODEL=text-embedding-3-small
DEEPSEEK_API_KEY=your_deepseek_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RAG_REINDEX_SECRET=your_reindex_secret
```

### 官方 OpenAI + 本地代理

若 `OPENAI_BASE_URL=https://api.openai.com/v1` 且 `pnpm run rag:check` 出现 `Connect Timeout`：

1. 确认 VPN/Clash 等已开启，并记住 HTTP 代理端口（常见 `7890` / `7897`）
2. 在 `.env.local` 或终端设置：
   ```bash
   export HTTPS_PROXY=http://127.0.0.1:7890
   export HTTP_PROXY=http://127.0.0.1:7890
   ```
3. 再执行 `pnpm run rag:check`

### OneAPI / New API 配置（无法使用代理时的备选）

RAG **索引与检索**依赖 `/v1/embeddings`，仅配置 chat 模型不够。按下列步骤在中转后台开通 embedding：

1. **新增渠道**
   - 类型：`OpenAI`
   - 模型：`text-embedding-3-small`（推荐）或 `text-embedding-ada-002`
   - 填入可用的 OpenAI API Key 或上游代理地址
2. **创建令牌**
   - 分组需包含上述 embedding 模型
   - 复制令牌到 `OPENAI_API_KEY`
3. **填写 `.env.local`**
   ```bash
   OPENAI_BASE_URL=https://你的OneAPI域名/v1
   OPENAI_API_KEY=sk-xxxxxxxx
   EMBEDDING_MODEL=text-embedding-3-small
   ```
4. **自检（索引前必跑）**
   ```bash
   pnpm run rag:check
   ```
   通过后再执行 `pnpm run rag:index`。

> 注意：向量维度必须为 **1536**，与 `scripts/sql/setup-rag.sql` 中 `vector(1536)` 一致。若上游只提供其他维度，需改库表并重建索引。

### Supabase 初始化

1. 在 Supabase SQL Editor 执行 `scripts/sql/setup-rag.sql`（站点表与其它 SQL 见 [scripts/README.md](scripts/README.md)）。
2. 确认 `rag_documents`、`rag_chunks` 和 `match_rag_chunks` 创建成功。
3. 确认 RLS 已启用，且没有开放匿名直接读取 RAG 表。

### 索引资料

```bash
pnpm run rag:check   # 先验证 embedding 中转
pnpm run rag:index
```

索引来源包括 `src/data/*` 静态资料、Supabase `projects` / `all_projects` 项目数据，以及 `kb_records` 中的文本和代码记录。
