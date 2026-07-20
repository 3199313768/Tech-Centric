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
const MAX_TIMING_ENTRIES = 20

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
  timings: Record<string, number>
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

function normalizeTimings(timings: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(timings)
      .slice(0, MAX_TIMING_ENTRIES)
      .filter((entry): entry is [string, number] => Number.isFinite(entry[1]))
      .map(([key, value]) => [key.slice(0, 64), Math.min(MAX_TIMING_MS, Math.max(0, value))]),
  )
}

export async function saveRagResponseSnapshot(snapshot: RagResponseSnapshot): Promise<void> {
  const admin = createAdminClient()
  if (!admin) throw new Error('RAG feedback storage is unavailable')

  const question = snapshot.question.trim()
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
    timings: normalizeTimings(snapshot.timings),
  }, { onConflict: 'id' })

  if (error) throw new Error('Failed to save RAG response snapshot')
}

export async function upsertRagFeedback(
  feedback: RagFeedbackPayload,
): Promise<'saved' | 'missing-response'> {
  const admin = createAdminClient()
  if (!admin) throw new Error('RAG feedback storage is unavailable')

  const { data: response, error: responseError } = await admin
    .from('rag_responses')
    .select('id')
    .eq('id', feedback.responseId)
    .eq('session_id', feedback.sessionId)
    .maybeSingle()

  if (responseError) throw new Error('Failed to check RAG response')
  if (!response) return 'missing-response'

  const { error } = await admin.from('rag_feedback').upsert({
    response_id: feedback.responseId,
    session_id: feedback.sessionId,
    helpful: feedback.helpful,
    reason: feedback.reason,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'response_id,session_id' })

  if (error) throw new Error('Failed to save RAG feedback')
  return 'saved'
}
