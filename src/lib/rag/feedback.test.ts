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
import {
  createRagRateLimitBucketKey,
  isRagChatRateLimited,
  isRagFeedbackRateLimited,
} from './rateLimit'
import { readLimitedRequestBody } from '@/app/api/rag/feedback/route'

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
    const lt = vi.fn().mockResolvedValue({ error: null })
    const deleteExpired = vi.fn().mockReturnValue({ lt })
    createAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({ upsert, delete: deleteExpired }),
    })

    const beforeSave = Date.now()

    await saveRagResponseSnapshot({
      responseId,
      sessionId,
      question: `  ${'q'.repeat(600)}  `,
      answer: 'a'.repeat(9_000),
      citedSourceIds: Array.from({ length: 25 }, (_, index) => ` source-${index} `),
      timings: { retrievalMs: -5, firstTokenMs: 2_000, totalMs: 999_999_999 },
    })

    const saved = upsert.mock.calls[0][0]
    expect(saved).toEqual(expect.objectContaining({
      id: responseId,
      session_id: sessionId,
      question_summary: 'q'.repeat(500),
      question_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      answer: 'a'.repeat(8_000),
      cited_source_ids: Array.from({ length: 20 }, (_, index) => `source-${index}`),
      timings: { retrievalMs: 0, firstTokenMs: 2_000, totalMs: 300_000 },
      expires_at: expect.any(String),
    }))
    expect(upsert).toHaveBeenCalledWith(saved, { onConflict: 'id' })
    expect(new Date(saved.expires_at).getTime()).toBeGreaterThanOrEqual(
      beforeSave + 90 * 24 * 60 * 60 * 1_000,
    )
    expect(deleteExpired).toHaveBeenCalledOnce()
    expect(lt).toHaveBeenCalledWith('expires_at', expect.any(String))
  })

  it('uses one atomic RPC to upsert feedback for the matching response session', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null })
    createAdminClient.mockReturnValue({ rpc })

    await expect(upsertRagFeedback({ responseId, sessionId, helpful: false, reason: 'incomplete' }))
      .resolves.toBe('saved')
    expect(rpc).toHaveBeenCalledWith('upsert_rag_feedback', {
      p_response_id: responseId,
      p_session_id: sessionId,
      p_helpful: false,
      p_reason: 'incomplete',
    })
  })

  it('maps an atomic RPC false result to missing-response', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null })
    createAdminClient.mockReturnValue({ rpc })

    await expect(upsertRagFeedback({ responseId, sessionId, helpful: true, reason: null }))
      .resolves.toBe('missing-response')
  })
})

describe('RAG rate-limit namespaces', () => {
  beforeEach(() => vi.clearAllMocks())

  it('replaces the raw client identifier with a stable namespace-specific hash', () => {
    const rawIp = '203.0.113.42'
    const chatKey = createRagRateLimitBucketKey('chat', rawIp, 'secret-a')

    expect(chatKey).toMatch(/^rag:chat:[a-f0-9]{64}$/)
    expect(chatKey).not.toContain(rawIp)
    expect(createRagRateLimitBucketKey('chat', rawIp, 'secret-a')).toBe(chatKey)
    expect(createRagRateLimitBucketKey('feedback', rawIp, 'secret-a')).not.toBe(chatKey)
    expect(createRagRateLimitBucketKey('chat', rawIp, 'secret-b')).not.toBe(chatKey)
  })

  it('isolates chat and feedback buckets and gives feedback 30 requests per minute', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: false, error: null })
    createAdminClient.mockReturnValue({ rpc })

    await isRagChatRateLimited('127.0.0.1')
    await isRagFeedbackRateLimited('127.0.0.1')

    expect(rpc).toHaveBeenNthCalledWith(1, 'check_rag_rate_limit', {
      p_bucket_key: createRagRateLimitBucketKey('chat', '127.0.0.1'),
      p_window_ms: 60_000,
      p_max_requests: 10,
    })
    expect(rpc).toHaveBeenNthCalledWith(2, 'check_rag_rate_limit', {
      p_bucket_key: createRagRateLimitBucketKey('feedback', '127.0.0.1'),
      p_window_ms: 60_000,
      p_max_requests: 30,
    })
  })
})

describe('readLimitedRequestBody', () => {
  it('cancels and rejects a chunked body as soon as it exceeds the byte cap', async () => {
    const cancel = vi.fn()
    const chunks = ['1234', '56789']
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        const chunk = chunks.shift()
        if (chunk) controller.enqueue(new TextEncoder().encode(chunk))
        else controller.close()
      },
      cancel,
    })
    const request = new Request('http://localhost/api/rag/feedback', {
      method: 'POST',
      body: stream,
      duplex: 'half',
    } as RequestInit)

    await expect(readLimitedRequestBody(request, 8)).resolves.toEqual({ ok: false, tooLarge: true })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('ignores an invalid content-length and reads a body within the cap', async () => {
    const request = new Request('http://localhost/api/rag/feedback', {
      method: 'POST',
      headers: { 'content-length': '-1' },
      body: '{}',
    })

    await expect(readLimitedRequestBody(request, 8)).resolves.toEqual({ ok: true, body: '{}' })
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
    expect(sql).toContain('expires_at timestamptz not null')
    expect(sql).toContain('rag_responses_expires_at_idx')
    expect(sql).toContain('create or replace function public.upsert_rag_feedback')
    expect(sql).toContain('insert into public.rag_feedback')
    expect(sql).toContain('from public.rag_responses')
    expect(sql).toContain('on conflict (response_id, session_id) do update')
    expect(sql).toContain('grant execute on function public.upsert_rag_feedback')
    expect(sql).toContain('create extension if not exists pg_cron')
    expect(sql).toContain('create or replace function public.cleanup_expired_rag_data')
    expect(sql).toContain('delete from public.rag_responses')
    expect(sql).toContain('where expires_at <= now()')
    expect(sql).toContain('revoke all on function public.cleanup_expired_rag_data() from public')
    expect(sql).toContain('grant execute on function public.cleanup_expired_rag_data() to service_role')
    expect(sql).toContain("from cron.job where jobname = 'cleanup-expired-rag-data'")
    expect(sql).toContain('cron.unschedule')
    expect(sql).toContain('cron.schedule')
  })
})
