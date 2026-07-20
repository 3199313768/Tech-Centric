import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createAdminClient } = vi.hoisted(() => ({ createAdminClient: vi.fn() }))

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient }))

import {
  parseRagFeedbackPayload,
  saveRagResponseSnapshot,
  upsertRagFeedback,
} from './feedback'
import { isRagChatRateLimited, isRagFeedbackRateLimited } from './rateLimit'

const responseId = '11111111-1111-4111-8111-111111111111'
const sessionId = '22222222-2222-4222-8222-222222222222'

describe('parseRagFeedbackPayload', () => {
  it('accepts positive feedback without a reason and normalizes it to null', () => {
    expect(parseRagFeedbackPayload({ responseId, sessionId, helpful: true })).toEqual({
      ok: true,
      value: { responseId, sessionId, helpful: true, reason: null },
    })
  })

  it.each([
    'inaccurate',
    'irrelevant_sources',
    'did_not_answer',
    'incomplete',
    'other',
  ] as const)('accepts negative feedback reason %s', reason => {
    expect(parseRagFeedbackPayload({ responseId, sessionId, helpful: false, reason })).toEqual({
      ok: true,
      value: { responseId, sessionId, helpful: false, reason },
    })
  })

  it('rejects negative feedback without a reason', () => {
    expect(parseRagFeedbackPayload({ responseId, sessionId, helpful: false })).toEqual({ ok: false })
  })

  it('rejects a reason on positive feedback', () => {
    expect(parseRagFeedbackPayload({ responseId, sessionId, helpful: true, reason: 'other' }))
      .toEqual({ ok: false })
  })

  it.each([
    { responseId: 'bad', sessionId, helpful: true },
    { responseId, sessionId: 'bad', helpful: true },
    { responseId, sessionId, helpful: false, reason: 'slow' },
    { responseId, sessionId, helpful: 'yes' },
    { responseId, sessionId, helpful: true, question: 'secret' },
    { responseId, sessionId, helpful: true, answer: 'secret' },
    { responseId, sessionId, helpful: true, source: 'secret' },
    { responseId, sessionId, helpful: true, ip: '127.0.0.1' },
    { responseId, sessionId, helpful: true, email: 'a@example.com' },
    { responseId, sessionId, helpful: true, userAgent: 'browser' },
    { responseId, sessionId, helpful: true, unexpected: true },
  ])('rejects invalid or extra fields: %#', payload => {
    expect(parseRagFeedbackPayload(payload)).toEqual({ ok: false })
  })
})

describe('feedback persistence', () => {
  beforeEach(() => vi.clearAllMocks())

  it('bounds and hashes the server-owned response snapshot', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    createAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert }),
    })

    await saveRagResponseSnapshot({
      responseId,
      sessionId,
      question: `  ${'q'.repeat(600)}  `,
      answer: 'a'.repeat(9_000),
      citedSourceIds: Array.from({ length: 25 }, (_, index) => ` source-${index} `),
      timings: { retrievalMs: -5, generationMs: 999_999_999 },
    })

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      id: responseId,
      session_id: sessionId,
      question_summary: 'q'.repeat(500),
      question_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      answer: 'a'.repeat(8_000),
      cited_source_ids: Array.from({ length: 20 }, (_, index) => `source-${index}`),
      timings: { retrievalMs: 0, generationMs: 300_000 },
    }), { onConflict: 'id' })
  })

  it('checks response ownership before upserting feedback', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: responseId }, error: null })
    const eqSession = vi.fn().mockReturnValue({ maybeSingle })
    const eqResponse = vi.fn().mockReturnValue({ eq: eqSession })
    const select = vi.fn().mockReturnValue({ eq: eqResponse })
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const from = vi.fn((table: string) => table === 'rag_responses'
      ? { select }
      : { upsert })
    createAdminClient.mockReturnValue({ from })

    await expect(upsertRagFeedback({ responseId, sessionId, helpful: false, reason: 'incomplete' }))
      .resolves.toBe('saved')
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      response_id: responseId,
      session_id: sessionId,
      helpful: false,
      reason: 'incomplete',
      updated_at: expect.any(String),
    }), { onConflict: 'response_id,session_id' })
  })

  it('does not upsert when the response and session do not match', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const eq = vi.fn()
    eq.mockReturnValueOnce({ eq }).mockReturnValueOnce({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const feedbackUpsert = vi.fn()
    createAdminClient.mockReturnValue({
      from: vi.fn((table: string) => table === 'rag_responses'
        ? { select }
        : { upsert: feedbackUpsert }),
    })

    await expect(upsertRagFeedback({ responseId, sessionId, helpful: true, reason: null }))
      .resolves.toBe('missing-response')
    expect(feedbackUpsert).not.toHaveBeenCalled()
  })
})

describe('RAG rate-limit namespaces', () => {
  beforeEach(() => vi.clearAllMocks())

  it('isolates chat and feedback buckets and gives feedback 30 requests per minute', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null })
    createAdminClient.mockReturnValue({ rpc })

    await isRagChatRateLimited('127.0.0.1')
    await isRagFeedbackRateLimited('127.0.0.1')

    expect(rpc).toHaveBeenNthCalledWith(1, 'check_rag_rate_limit', {
      p_bucket_key: 'rag:chat:127.0.0.1',
      p_window_ms: 60_000,
      p_max_requests: 10,
    })
    expect(rpc).toHaveBeenNthCalledWith(2, 'check_rag_rate_limit', {
      p_bucket_key: 'rag:feedback:127.0.0.1',
      p_window_ms: 60_000,
      p_max_requests: 30,
    })
  })
})

describe('feedback SQL patch', () => {
  const sql = readFileSync(
    join(process.cwd(), 'scripts/sql/patch-rag-hybrid-search-feedback.sql'),
    'utf8',
  ).toLowerCase()

  it('creates cascade-linked response feedback tables with service-role-only access', () => {
    expect(sql).toContain('create table if not exists public.rag_responses')
    expect(sql).toContain('create table if not exists public.rag_feedback')
    expect(sql).toContain('on delete cascade')
    expect(sql).toContain('unique (response_id, session_id)')
    expect(sql).toContain('enable row level security')
    expect(sql).toContain("auth.role() = 'service_role'")
    expect(sql).toContain('revoke all on table public.rag_responses from anon, authenticated')
    expect(sql).toContain('revoke all on table public.rag_feedback from anon, authenticated')
  })
})
