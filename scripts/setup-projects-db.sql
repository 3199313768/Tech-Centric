-- 创建 projects 表 (对应 src/data/projects.ts)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  image TEXT,
  demo_url TEXT,
  github_url TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 设置 projects 表的安全策略 (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许公开读取 projects" ON public.projects FOR SELECT USING (true);


-- 创建 all_projects 表 (对应 src/data/allProjects.ts)
CREATE TABLE IF NOT EXISTS public.all_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  role_and_contribution TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 设置 all_projects 表的安全策略 (RLS)
ALTER TABLE public.all_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许公开读取 all_projects" ON public.all_projects FOR SELECT USING (true);
