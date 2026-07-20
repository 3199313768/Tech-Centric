import { createHash } from 'node:crypto'

import { createAdminClient } from '@/lib/supabase/admin'

export const RAG_RATE_LIMIT_WINDOW_MS = 60_000
export const RAG_RATE_LIMIT_MAX_REQUESTS = 10
export const RAG_FEEDBACK_RATE_LIMIT_MAX_REQUESTS = 30

type RagRateLimitNamespace = 'chat' | 'feedback'

const memoryBuckets = new Map<string, { count: number; resetAt: number }>()

export function createRagRateLimitBucketKey(
  namespace: RagRateLimitNamespace,
  rawBucketKey: string,
): string {
  const hash = createHash('sha256')
    .update(`${namespace}:${rawBucketKey}`)
    .digest('hex')
  return `rag:${namespace}:${hash}`
}

function isMemoryRateLimited(bucketKey: string, maxRequests: number): boolean {
  const now = Date.now()
  const bucket = memoryBuckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(bucketKey, { count: 1, resetAt: now + RAG_RATE_LIMIT_WINDOW_MS })
    return false
  }

  bucket.count += 1
  return bucket.count > maxRequests
}

async function isRagRateLimited(
  namespace: RagRateLimitNamespace,
  bucketKey: string,
  maxRequests: number,
): Promise<boolean> {
  const namespacedBucketKey = createRagRateLimitBucketKey(namespace, bucketKey)
  const admin = createAdminClient()
  if (!admin) return isMemoryRateLimited(namespacedBucketKey, maxRequests)

  const { data, error } = await admin.rpc('check_rag_rate_limit', {
    p_bucket_key: namespacedBucketKey,
    p_window_ms: RAG_RATE_LIMIT_WINDOW_MS,
    p_max_requests: maxRequests,
  })

  if (error || typeof data !== 'boolean') {
    return isMemoryRateLimited(namespacedBucketKey, maxRequests)
  }

  return data
}

export function isRagChatRateLimited(bucketKey: string): Promise<boolean> {
  return isRagRateLimited('chat', bucketKey, RAG_RATE_LIMIT_MAX_REQUESTS)
}

export function isRagFeedbackRateLimited(bucketKey: string): Promise<boolean> {
  return isRagRateLimited('feedback', bucketKey, RAG_FEEDBACK_RATE_LIMIT_MAX_REQUESTS)
}
