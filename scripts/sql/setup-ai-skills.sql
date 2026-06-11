-- 1. 创建 ai_skills 表
CREATE TABLE IF NOT EXISTS public.ai_skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  platform TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 设置 RLS 策略
ALTER TABLE public.ai_skills ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户完全操作 (因为个人展示项目没有加鉴权)
CREATE POLICY "允许匿名用户读取 ai_skills" ON public.ai_skills FOR SELECT USING (true);
CREATE POLICY "允许匿名用户修改 ai_skills" ON public.ai_skills FOR ALL USING (true) WITH CHECK (true);

-- 3. 初始数据导入
INSERT INTO public.ai_skills (id, name, icon, description, tags, platform, link) VALUES 
('auto-commit', '自动提交代码 (auto-commit)', '⚡', '智能分析代码变更，自动生成符合 Conventional Commits 规范的提交信息，并完成提交和推送。', '{"Git", "Conventional Commits", "Shell"}', 'Shell', 'https://github.com/3199313768/SKILL/tree/main/auto-commit'),
('commit-convention', '提交规范校验 (commit-convention)', '✅', '通过 Git commit-msg hook 自动校验提交信息格式，确保代码提交历史的一致性和可追溯性。', '{"Git", "Hook", "Conventional Commits"}', 'Git Hook', 'https://github.com/3199313768/SKILL/tree/main/commit-convention'),
('weekly-report', '周报生成 (weekly-report)', '📊', '基于 Git 提交记录自动生成程序员周报，支持约定式提交分类，符合企业级周报标准。', '{"Python", "Git", "周报"}', 'Python', 'https://github.com/3199313768/SKILL/tree/main/weekly-report'),
('ui-style-optimization', 'UI 样式优化 (ui-style-optimization)', '🎨', '基于 Type Scale 字号阶梯规则优化 Web 字体、字号、排版。支持 Prompt 对话与脚本自动分析两种模式。', '{"Type Scale", "Typography", "Python"}', 'Python', 'https://github.com/3199313768/SKILL/tree/main/ui-style-optimization'),
('code-audit', '代码审计 (code-audit)', '🔍', '从 Git 仓库提取提交记录，使用 AI 分析工程师工作表现，生成审计报告并通过 SMTP 发送邮件。', '{"Python", "AI", "审计"}', 'Python', 'https://github.com/3199313768/SKILL/tree/main/code-audit')
ON CONFLICT (id) DO NOTHING;
