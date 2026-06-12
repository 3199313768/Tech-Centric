'use server'

import { requireAuthenticatedUser } from '@/lib/auth/requireUser'
import { runRagReindexNow } from '@/lib/rag/reindexTrigger'
import type { RagIndexStats } from '@/lib/rag/indexer'

export async function triggerRagReindex(): Promise<{ error: string | null; stats?: RagIndexStats }> {
  const { error: authError } = await requireAuthenticatedUser()
  if (authError) return { error: authError }

  return runRagReindexNow()
}
