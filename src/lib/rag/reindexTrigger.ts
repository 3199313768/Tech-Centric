import { after } from 'next/server'
import { runRagIndex } from '@/lib/rag/indexer'

function canRunRagReindex(): boolean {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY
    && process.env.OPENAI_API_KEY
    && process.env.NEXT_PUBLIC_SUPABASE_URL,
  )
}

/** 内容保存后在后台重建 RAG 索引，不阻塞用户请求 */
export function scheduleRagReindex(reason?: string): void {
  if (!canRunRagReindex()) return

  after(async () => {
    try {
      await runRagIndex()
    } catch (error) {
      console.error('Background RAG reindex failed:', reason ?? 'unspecified', error)
    }
  })
}

/** Studio 手动触发：同步执行并返回统计 */
export async function runRagReindexNow(): Promise<{ error: string | null; stats?: Awaited<ReturnType<typeof runRagIndex>> }> {
  if (!canRunRagReindex()) {
    return { error: 'RAG 环境未配置（需 SUPABASE_SERVICE_ROLE_KEY 与 OPENAI_API_KEY）' }
  }

  try {
    const stats = await runRagIndex()
    return { error: null, stats }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'RAG 索引失败'
    return { error: message }
  }
}
