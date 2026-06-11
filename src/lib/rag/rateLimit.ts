import { createAdminClient } from '@/lib/supabase/admin'

export const RAG_RATE_LIMIT_WINDOW_MS = 60_000
export const RAG_RATE_LIMIT_MAX_REQUESTS = 10

const memoryBuckets = new Map<string, { count: number; resetAt: number }>()

function isMemoryRateLimited(bucketKey: string): boolean {
  const now = Date.now()
  const bucket = memoryBuckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(bucketKey, { count: 1, resetAt: now + RAG_RATE_LIMIT_WINDOW_MS })
    return false
  }

  bucket.count += 1
  return bucket.count > RAG_RATE_LIMIT_MAX_REQUESTS
}

export async function isRagChatRateLimited(bucketKey: string): Promise<boolean> {
  const admin = createAdminClient()
  if (!admin) return isMemoryRateLimited(bucketKey)

  const { data, error } = await admin.rpc('check_rag_rate_limit', {
    p_bucket_key: bucketKey,
    p_window_ms: RAG_RATE_LIMIT_WINDOW_MS,
    p_max_requests: RAG_RATE_LIMIT_MAX_REQUESTS,
  })

  if (error || typeof data !== 'boolean') {
    return isMemoryRateLimited(bucketKey)
  }

  return data
}
