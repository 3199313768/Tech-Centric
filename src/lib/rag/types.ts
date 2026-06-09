export type RagSourceType =
  | 'static_personal'
  | 'static_project'
  | 'static_resource'
  | 'knowledge_record'

export interface RagDocumentInput {
  sourceType: RagSourceType
  sourceId: string
  title: string
  content: string
  url?: string | null
  summary?: string | null
  tags: string[]
  isPublic: boolean
}

export interface RagChunkInput {
  document: RagDocumentInput
  chunkIndex: number
  content: string
  tokenEstimate: number
  metadata: Record<string, unknown>
}

export interface RagSearchResult {
  chunk_id: string
  document_id: string
  content: string
  title: string
  url: string | null
  source_type: RagSourceType
  tags: string[]
  similarity: number
}

export interface RagSource {
  title: string
  url: string | null
  sourceType: RagSourceType
  similarity: number
}

export interface MessageAction {
  id: string
  label: string
  kind: 'primary' | 'secondary' | 'ghost'
}

export interface ContactSummaryData {
  subject: string
  body: string
  email: string
  phone: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: RagSource[]
  actions?: MessageAction[]
  variant?: 'default' | 'contact' | 'system'
  contactSummary?: ContactSummaryData
}
