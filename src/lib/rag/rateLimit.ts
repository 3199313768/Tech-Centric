import { createHmac, randomBytes } from 'node:crypto'

import { createAdminClient } from '@/lib/supabase/admin'

export const RAG_RATE_LIMIT_WINDOW_MS = 60_000
export const RAG_RATE_LIMIT_MAX_REQUESTS = 10
export const RAG_FEEDBACK_RATE_LIMIT_MAX_REQUESTS = 30

type RagRateLimitNamespace = 'chat' | 'feedback'

const MEMORY_BUCKET_LIMIT = 1_000
const CLEANUP_INTERVAL = 100
const rateLimitSecret = process.env.RAG_RATE_LIMIT_SECRET
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || randomBytes(32).toString('hex')
const memoryBuckets = new Map<string, { count: number; resetAt: number }>()
let memoryRequestCount = 0
let databaseRequestCount = 0

export function createRagRateLimitBucketKey(
  namespace: RagRateLimitNamespace,
  rawBucketKey: string,
  secret = rateLimitSecret,
): string {
  const hash = createHmac('sha256', secret)
    .update(`${namespace}:${rawBucketKey}`)
    .digest('hex')
  return `rag:${namespace}:${hash}`
}

function cleanupMemoryBuckets(now: number) {
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key)
  }
}

function isMemoryRateLimited(bucketKey: string, maxRequests: number): boolean {
  const now = Date.now()
  memoryRequestCount += 1
  if (memoryRequestCount % CLEANUP_INTERVAL === 0 || memoryBuckets.size >= MEMORY_BUCKET_LIMIT) {
    cleanupMemoryBuckets(now)
  }

  const bucket = memoryBuckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    if (memoryBuckets.size >= MEMORY_BUCKET_LIMIT) {
      const oldestKey = memoryBuckets.keys().next().value
      if (typeof oldestKey === 'string') memoryBuckets.delete(oldestKey)
    }
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

  databaseRequestCount += 1
  if (databaseRequestCount % CLEANUP_INTERVAL === 0) {
    try {
      await admin
        .from('rag_rate_limit_buckets')
        .delete()
        .lt('reset_at', new Date().toISOString())
    } catch {
      // Cleanup is best-effort; limiting still proceeds through the RPC.
    }
  }

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
