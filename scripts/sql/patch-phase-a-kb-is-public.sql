-- Phase A：知识库记录级公开（Q2A）
-- 执行前请确认 docs/setup/SupabaseSetup.sql 已运行

ALTER TABLE public.kb_records
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- 匿名只读公开记录
CREATE POLICY "Public kb_records are readable"
  ON public.kb_records
  FOR SELECT
  USING (is_public = true);
