/**
 * RAG 领域类型：检索候选、证据、SSE 事件、聊天 UI 消息。
 * 协议编码见 `protocol.ts`；流消费见 `chatStream.ts`。
 */

/** 索引来源类别（静态站内内容 / 知识库 / vibe）。 */
export type RagSourceType =
  | 'static_personal'
  | 'static_project'
  | 'static_resource'
  | 'knowledge_record'
  | 'vibe_entry'

/** 当前页面上下文，用于 fusion 加权；与协议白名单一致。 */
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

/** 单路检索命中（向量或词法），融合前形态。 */
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

/** 向量 + 词法融合后的候选。 */
export interface FusedRagCandidate extends RagRetrievalCandidate {
  fusedScore: number
  matchedChannels: Array<'vector' | 'lexical'>
}

/**
 * 注入 prompt 的上下文块。
 * `contextId` 为 `S1`/`S2`…，模型引用 `[S1]`，done 时再映射为展示用 `RagSource`。
 */
export interface RagContextSource extends FusedRagCandidate {
  contextId: `S${number}`
}

/**
 * 证据强弱：
 * - site：站内证据充足
 * - insufficient：证据弱，回答需更保守
 * - general：无有效站内证据，偏通用回复
 */
export type RagEvidenceMode = 'site' | 'insufficient' | 'general'

/** 写入索引的文档输入。 */
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

/** 文档切块后的索引输入。 */
export interface RagChunkInput {
  document: RagDocumentInput
  chunkIndex: number
  content: string
  tokenEstimate: number
  metadata: Record<string, unknown>
}

/** 向量检索 RPC / 遗留返回形态（snake_case）。 */
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

/** 展示给用户的引用源（done 事件与气泡 `sources`）。 */
export interface RagSource {
  citation: number
  sourceId: string
  title: string
  url: string | null
  sourceType: RagSourceType
  excerpt: string
}

/** `/api/rag/chat` POST body（校验后）。 */
export interface RagChatRequest {
  message: string
  pageContext: RagPageContext | null
  sessionId: string | null
}

/**
 * 服务端 → 客户端 SSE 事件（`encodeRagSse` / `consumeRagChatStream`）。
 * - meta：会话与反馈 id
 * - delta：增量文本
 * - done：最终答案 + 引用 + 耗时（权威终态）
 * - error：流内失败
 */
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

/** 助手气泡内可点击动作（如联系站长）。 */
export interface MessageAction {
  id: string
  label: string
  kind: 'primary' | 'secondary' | 'ghost'
}

/** 联系流程汇总卡片数据。 */
export interface ContactSummaryData {
  subject: string
  body: string
  email: string
  phone: string
}

/**
 * 聊天面板消息。
 * 流式中：`isComplete === false`；done 后写满 sources / evidenceMode。
 * `variant` 区分普通回答、联系流、系统提示。
 */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: RagSource[]
  responseId?: string
  sessionId?: string
  evidenceMode?: RagEvidenceMode
  isComplete?: boolean
  error?: string
  actions?: MessageAction[]
  variant?: 'default' | 'contact' | 'system'
  contactSummary?: ContactSummaryData
}
