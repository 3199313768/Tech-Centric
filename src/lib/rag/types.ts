export type RagSourceType =
  | 'static_personal'
  | 'static_project'
  | 'static_resource'
  | 'knowledge_record'
  | 'vibe_entry'

export type RagPageContext =
  | 'projects'
  | 'skills'
  | 'knowledge'
  | 'resources'
  | 'vibe'
  | 'about'
  | 'showcase'
  | 'search'
  | 'stats'

export interface RagRetrievalCandidate {
  chunkId: string
  documentId: string
  sourceId: string
  content: string
  excerpt: string
  title: string
  url: string | null
  sourceType: RagSourceType
  tags: string[]
  similarity: number | null
  lexicalScore: number | null
  exactMatch: boolean
}

export interface FusedRagCandidate extends RagRetrievalCandidate {
  fusedScore: number
  matchedChannels: Array<'vector' | 'lexical'>
}

export interface RagContextSource extends FusedRagCandidate {
  contextId: `S${number}`
}

export type RagEvidenceMode = 'site' | 'insufficient' | 'general'

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
  citation: number
  sourceId: string
  title: string
  url: string | null
  sourceType: RagSourceType
  excerpt: string
}

export interface RagChatRequest {
  message: string
  pageContext: RagPageContext | null
  sessionId: string | null
}

export type RagSseEvent =
  | {
      type: 'meta'
      responseId: string
      sessionId: string
    }
  | { type: 'delta'; text: string }
  | {
      type: 'done'
      answer: string
      sources: RagSource[]
      evidenceMode: RagEvidenceMode
      retrievalMs: number
      firstTokenMs: number
      totalMs: number
    }
  | { type: 'error'; error: string }

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
