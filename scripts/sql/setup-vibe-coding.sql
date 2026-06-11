-- 1. 创建 vibe_coding 表
CREATE TABLE IF NOT EXISTS public.vibe_coding (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 设置 RLS 策略
ALTER TABLE public.vibe_coding ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户完全操作 (个人展示项目)
CREATE POLICY "允许匿名用户读取 vibe_coding" ON public.vibe_coding FOR SELECT USING (true);
CREATE POLICY "允许匿名用户修改 vibe_coding" ON public.vibe_coding FOR ALL USING (true) WITH CHECK (true);

-- 3. 初始数据导入
INSERT INTO public.vibe_coding (id, name, description, url, icon) VALUES 
('ai-table', 'AI思维圆桌', '让思想，在分歧中变得完整。多角色 AI 圆桌讨论，支持主持人、逻辑审查者、创新者等角色。', 'https://ai-table-eosin.vercel.app/', '🪑'),
('ai-news', '每日简报', 'AI 驱动的每日新闻简报，聚合重要资讯。', 'https://ai-news-ochre-sigma.vercel.app/', '📰')
ON CONFLICT (id) DO NOTHING;
