-- Phase A：all_projects 详情字段（Q4A）
-- 执行前请确认 setup-projects-db.sql 已运行

ALTER TABLE public.all_projects
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tech_stack TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS period TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 已有行：slug 回退为 id
UPDATE public.all_projects
SET slug = id
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_all_projects_slug ON public.all_projects (slug);
