import { createHash } from 'node:crypto'

import { createAdminClient } from '@/lib/supabase/admin'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FEEDBACK_REASONS = [
  'inaccurate',
  'irrelevant_sources',
  'did_not_answer',
  'incomplete',
  'other',
] as const
const FEEDBACK_KEYS = new Set(['responseId', 'sessionId', 'helpful', 'reason'])
const MAX_QUESTION_SUMMARY_LENGTH = 500
const MAX_ANSWER_LENGTH = 8_000
const MAX_CITED_SOURCE_IDS = 20
const MAX_TIMING_MS = 300_000
const RESPONSE_TTL_MS = 90 * 24 * 60 * 60 * 1_000

export type RagFeedbackReason = typeof FEEDBACK_REASONS[number]

export interface RagFeedbackPayload {
  responseId: string
  sessionId: string
  helpful: boolean
  reason: RagFeedbackReason | null
}

export type RagFeedbackParseResult =
  | { ok: true; value: RagFeedbackPayload }
  | { ok: false }

export interface RagResponseSnapshot {
  responseId: string
  sessionId: string
  question: string
  answer: string
  citedSourceIds: string[]
  timings: {
    retrievalMs: number
    firstTokenMs: number
    totalMs: number
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseRagFeedbackPayload(value: unknown): RagFeedbackParseResult {
  if (!isRecord(value) || Object.keys(value).some(key => !FEEDBACK_KEYS.has(key))) {
    return { ok: false }
  }

  const { responseId, sessionId, helpful, reason } = value
  if (
    typeof responseId !== 'string'
    || !UUID_PATTERN.test(responseId)
    || typeof sessionId !== 'string'
    || !UUID_PATTERN.test(sessionId)
    || typeof helpful !== 'boolean'
  ) {
    return { ok: false }
  }

  if (helpful) {
    return reason === undefined
      ? { ok: true, value: { responseId, sessionId, helpful, reason: null } }
      : { ok: false }
  }

  if (typeof reason !== 'string' || !FEEDBACK_REASONS.includes(reason as RagFeedbackReason)) {
    return { ok: false }
  }

  return {
    ok: true,
    value: { responseId, sessionId, helpful, reason: reason as RagFeedbackReason },
  }
}

function boundTiming(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(MAX_TIMING_MS, Math.max(0, value))
}

export async function saveRagResponseSnapshot(snapshot: RagResponseSnapshot): Promise<void> {
  const admin = createAdminClient()
  if (!admin) throw new Error('RAG feedback storage is unavailable')

  const question = snapshot.question.trim()
  const now = Date.now()
  const { error } = await admin.from('rag_responses').upsert({
    id: snapshot.responseId,
    session_id: snapshot.sessionId,
    question_summary: question.slice(0, MAX_QUESTION_SUMMARY_LENGTH),
    question_hash: createHash('sha256').update(question).digest('hex'),
    answer: snapshot.answer.slice(0, MAX_ANSWER_LENGTH),
    cited_source_ids: snapshot.citedSourceIds
      .slice(0, MAX_CITED_SOURCE_IDS)
      .map(sourceId => sourceId.trim().slice(0, 200))
      .filter(Boolean),
    timings: {
      retrievalMs: boundTiming(snapshot.timings.retrievalMs),
      firstTokenMs: boundTiming(snapshot.timings.firstTokenMs),
      totalMs: boundTiming(snapshot.timings.totalMs),
    },
    expires_at: new Date(now + RESPONSE_TTL_MS).toISOString(),
  }, { onConflict: 'id' })

  if (error) throw new Error('Failed to save RAG response snapshot')

  try {
    const { error: cleanupError } = await admin
      .from('rag_responses')
      .delete()
      .lt('expires_at', new Date(now).toISOString())
    if (cleanupError) console.warn('RAG response expiry cleanup failed')
  } catch {
    console.warn('RAG response expiry cleanup failed')
  }
}

export async function upsertRagFeedback(
  feedback: RagFeedbackPayload,
): Promise<'saved' | 'missing-response'> {
  const admin = createAdminClient()
  if (!admin) throw new Error('RAG feedback storage is unavailable')

  const { data, error } = await admin.rpc('upsert_rag_feedback', {
    p_response_id: feedback.responseId,
    p_session_id: feedback.sessionId,
    p_helpful: feedback.helpful,
    p_reason: feedback.reason,
  })

  if (error) throw new Error('Failed to save RAG feedback')
  return data === true ? 'saved' : 'missing-response'
}
