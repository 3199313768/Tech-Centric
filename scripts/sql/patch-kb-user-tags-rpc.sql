-- 知识库：按用户聚合 distinct tags（替代应用层分页扫描）
-- 在 SupabaseSetup.sql 执行后运行；依赖 kb_records.tags (text[])

CREATE OR REPLACE FUNCTION public.get_kb_user_tags(p_user_id UUID)
RETURNS SETOF TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT t
  FROM public.kb_records,
       LATERAL unnest(tags) AS t
  WHERE user_id = p_user_id
    AND t IS NOT NULL
    AND btrim(t) <> ''
  ORDER BY t;
$$;

GRANT EXECUTE ON FUNCTION public.get_kb_user_tags(UUID) TO authenticated;
