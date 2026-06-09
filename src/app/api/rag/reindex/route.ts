import { NextResponse } from 'next/server'
import { runRagIndex } from '@/lib/rag/indexer'

export async function POST(req: Request) {
  const secret = process.env.RAG_REINDEX_SECRET
  const provided = req.headers.get('x-rag-secret')

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = await runRagIndex()
    return NextResponse.json({ ok: true, stats })
  } catch (error) {
    console.error('RAG reindex error:', error)
    return NextResponse.json({ error: 'RAG reindex failed' }, { status: 500 })
  }
}
