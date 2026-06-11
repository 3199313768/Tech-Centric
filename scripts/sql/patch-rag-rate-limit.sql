-- RAG 公开聊天 API 分布式 rate limit（Serverless 多实例共享）
-- 仅 service role / SECURITY DEFINER RPC 可写；需在 Route Handler 使用 SUPABASE_SERVICE_ROLE_KEY

CREATE TABLE IF NOT EXISTS public.rag_rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  request_count INT NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.rag_rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rag_rate_limit(
  p_bucket_key TEXT,
  p_window_ms BIGINT,
  p_max_requests INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_ts TIMESTAMPTZ := NOW();
  bucket public.rag_rate_limit_buckets%ROWTYPE;
  window_interval INTERVAL := (p_window_ms || ' milliseconds')::INTERVAL;
BEGIN
  SELECT * INTO bucket
  FROM public.rag_rate_limit_buckets
  WHERE bucket_key = p_bucket_key
  FOR UPDATE;

  IF NOT FOUND OR bucket.reset_at <= now_ts THEN
    INSERT INTO public.rag_rate_limit_buckets (bucket_key, request_count, reset_at)
    VALUES (p_bucket_key, 1, now_ts + window_interval)
    ON CONFLICT (bucket_key) DO UPDATE
      SET request_count = 1,
          reset_at = now_ts + window_interval;
    RETURN FALSE;
  END IF;

  IF bucket.request_count >= p_max_requests THEN
    RETURN TRUE;
  END IF;

  UPDATE public.rag_rate_limit_buckets
  SET request_count = bucket.request_count + 1
  WHERE bucket_key = p_bucket_key;

  RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rag_rate_limit(TEXT, BIGINT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rag_rate_limit(TEXT, BIGINT, INT) TO service_role;
