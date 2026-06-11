-- Phase B：草本集合并长文（Q1B）
-- 执行前请确认 setup-vibe-coding.sql 已运行

ALTER TABLE public.vibe_coding
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'project',
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

UPDATE public.vibe_coding SET kind = 'project' WHERE kind IS NULL OR kind = '';
UPDATE public.vibe_coding SET slug = id WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_vibe_coding_slug ON public.vibe_coding (slug);

ALTER TABLE public.vibe_coding
  DROP CONSTRAINT IF EXISTS vibe_coding_kind_check;

ALTER TABLE public.vibe_coding
  ADD CONSTRAINT vibe_coding_kind_check CHECK (kind IN ('project', 'note', 'article'));
