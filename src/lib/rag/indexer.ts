import { createClient } from '@supabase/supabase-js'
import { chunkDocument, createContentHash } from './chunk'
import { createEmbedding } from './embedding'
import { getStaticRagDocuments } from './staticSources'
import type { RagDocumentInput } from './types'

const MANAGED_SOURCE_TYPES = ['static_personal', 'static_project', 'static_resource', 'knowledge_record']

interface KnowledgeRecord {
  id: string
  type: string
  content: string
  tags?: string[] | null
  created_at?: string
  updated_at?: string | null
}

interface AllProjectRecord {
  id: string
  name: string
  url?: string | null
  is_public?: boolean | null
  category?: string | null
  description?: string | null
  role_and_contribution?: string | null
  tags?: string[] | null
}

interface ExistingRagDocument {
  id: string
  source_type: string
  source_id: string
  is_public: boolean
}

export interface RagIndexStats {
  indexed: number
  skipped: number
  chunks: number
  documents: number
  depublished: number
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function createPublicReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for public source reads')
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

async function loadKnowledgeDocuments(): Promise<RagDocumentInput[]> {
  const supabase = createPublicReadClient()
  const { data, error } = await supabase
    .from('kb_records')
    .select('id,type,content,tags,created_at,updated_at')
    .in('type', ['text', 'code'])
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.warn(`Skipping kb_records ingestion because no public records are readable: ${error.message}`)
    return []
  }

  return ((data || []) as KnowledgeRecord[]).filter(record => record.content?.trim()).map(record => ({
    sourceType: 'knowledge_record',
    sourceId: record.id,
    title: `知识库记录 ${record.created_at ? new Date(record.created_at).toLocaleDateString('zh-CN') : record.id.slice(0, 8)}`,
    url: '/knowledge',
    summary: record.content.slice(0, 120),
    tags: record.tags || [],
    isPublic: true,
    content: [
      `类型：${record.type}`,
      record.tags?.length ? `标签：${record.tags.join('、')}` : '',
      `内容：${record.content}`,
    ].filter(Boolean).join('\n'),
  }))
}

async function loadProjectDocuments(): Promise<RagDocumentInput[]> {
  const supabase = createPublicReadClient()
  const documents: RagDocumentInput[] = []

  console.warn('Skipping projects ingestion until the projects table has an explicit public visibility field')

  const { data: allProjects, error: allProjectsError } = await supabase
    .from('all_projects')
    .select('id,name,url,is_public,category,description,role_and_contribution,tags')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (allProjectsError) {
    console.warn(`Skipping all_projects ingestion: ${allProjectsError.message}`)
  } else {
    for (const project of (allProjects || []) as AllProjectRecord[]) {
      documents.push({
        sourceType: 'static_project',
        sourceId: `all-project-${project.id}`,
        title: project.name,
        url: project.url || '/',
        summary: project.description || null,
        tags: ['全部项目', project.category || '未分类', ...(project.tags || [])],
        isPublic: project.is_public !== false,
        content: [
          `项目：${project.name}`,
          project.category ? `分类：${project.category}` : '',
          project.description ? `描述：${project.description}` : '',
          project.role_and_contribution ? `职责与贡献：${project.role_and_contribution}` : '',
          project.tags?.length ? `标签：${project.tags.join('、')}` : '',
        ].filter(Boolean).join('\n'),
      })
    }
  }

  return documents
}

async function upsertDocument(document: RagDocumentInput) {
  const supabase = createServiceClient()
  const contentHash = createDocumentHash(document)
  const pendingHash = `pending:${contentHash}`

  const { data: existing, error: existingError } = await supabase
    .from('rag_documents')
    .select('id,content_hash')
    .eq('source_type', document.sourceType)
    .eq('source_id', document.sourceId)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Failed to inspect document ${document.sourceType}/${document.sourceId}: ${existingError.message}`)
  }

  if (existing?.content_hash === contentHash) {
    return { status: 'skipped' as const, chunks: 0 }
  }

  const { data: savedDocument, error: upsertError } = await supabase
    .from('rag_documents')
    .upsert({
      source_type: document.sourceType,
      source_id: document.sourceId,
      title: document.title,
      url: document.url || null,
      summary: document.summary || null,
      tags: document.tags,
      is_public: false,
      content_hash: pendingHash,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'source_type,source_id' })
    .select('id')
    .single()

  if (upsertError || !savedDocument) {
    throw new Error(`Failed to upsert document ${document.title}: ${upsertError?.message || 'missing row'}`)
  }

  const { error: deleteError } = await supabase
    .from('rag_chunks')
    .delete()
    .eq('document_id', savedDocument.id)

  if (deleteError) {
    throw new Error(`Failed to delete old chunks for ${document.title}: ${deleteError.message}`)
  }

  const chunks = chunkDocument(document)
  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk.content)
    const { error: chunkError } = await supabase.from('rag_chunks').insert({
      document_id: savedDocument.id,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding,
      token_estimate: chunk.tokenEstimate,
      metadata: chunk.metadata,
    })

    if (chunkError) {
      throw new Error(`Failed to insert chunk ${chunk.chunkIndex} for ${document.title}: ${chunkError.message}`)
    }
  }

  const { error: finalizeError } = await supabase
    .from('rag_documents')
    .update({ content_hash: contentHash, is_public: document.isPublic, updated_at: new Date().toISOString() })
    .eq('id', savedDocument.id)

  if (finalizeError) {
    throw new Error(`Failed to finalize document ${document.title}: ${finalizeError.message}`)
  }

  return { status: 'indexed' as const, chunks: chunks.length }
}

function createDocumentHash(document: RagDocumentInput) {
  return createContentHash(JSON.stringify({
    sourceType: document.sourceType,
    sourceId: document.sourceId,
    title: document.title,
    content: document.content,
    url: document.url || null,
    summary: document.summary || null,
    tags: [...document.tags].sort(),
    isPublic: document.isPublic,
  }))
}

async function depublishMissingDocuments(documents: RagDocumentInput[]) {
  const supabase = createServiceClient()
  const activeKeys = new Set(documents.map(document => `${document.sourceType}:${document.sourceId}`))

  const { data, error } = await supabase
    .from('rag_documents')
    .select('id,source_type,source_id,is_public')
    .in('source_type', MANAGED_SOURCE_TYPES)

  if (error) {
    throw new Error(`Failed to inspect stale RAG documents: ${error.message}`)
  }

  const staleDocuments = ((data || []) as ExistingRagDocument[]).filter(document => {
    return document.is_public && !activeKeys.has(`${document.source_type}:${document.source_id}`)
  })

  for (const document of staleDocuments) {
    const { error: updateError } = await supabase
      .from('rag_documents')
      .update({ is_public: false, updated_at: new Date().toISOString() })
      .eq('id', document.id)

    if (updateError) {
      throw new Error(`Failed to depublish stale RAG document ${document.source_type}/${document.source_id}: ${updateError.message}`)
    }
  }

  return staleDocuments.length
}

export async function loadRagDocuments() {
  return [
    ...getStaticRagDocuments(),
    ...await loadProjectDocuments(),
    ...await loadKnowledgeDocuments(),
  ]
}

export async function runRagIndex(options: { log?: boolean } = {}): Promise<RagIndexStats> {
  const documents = await loadRagDocuments()
  let indexed = 0
  let skipped = 0
  let chunks = 0

  for (const document of documents) {
    const result = await upsertDocument(document)
    if (result.status === 'indexed') indexed += 1
    if (result.status === 'skipped') skipped += 1
    chunks += result.chunks

    if (options.log) {
      console.log(`${result.status}: ${document.sourceType}/${document.sourceId} (${result.chunks} chunks)`)
    }
  }

  const depublished = await depublishMissingDocuments(documents)

  if (options.log && depublished > 0) {
    console.log(`depublished: ${depublished} stale documents`)
  }

  return {
    indexed,
    skipped,
    chunks,
    documents: documents.length,
    depublished,
  }
}
