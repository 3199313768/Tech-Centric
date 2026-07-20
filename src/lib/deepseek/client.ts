import { proxyFetch } from '@/lib/rag/proxyFetch'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek-v4-flash'
const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_STREAM_TIMEOUT_MS = 60_000

export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type DeepSeekChatOptions = {
  messages: DeepSeekMessage[]
  temperature?: number
  responseFormat?: { type: 'json_object' }
  timeoutMs?: number
}

interface DeepSeekResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

interface DeepSeekStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string
    }
  }>
}

function getApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured')
  }
  return apiKey
}

function buildRequestBody(options: DeepSeekChatOptions, stream: boolean) {
  return {
    model: DEFAULT_MODEL,
    thinking: { type: 'disabled' as const },
    messages: options.messages,
    stream,
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
  }
}

async function createDeepSeekResponse(options: DeepSeekChatOptions, stream: boolean) {
  const apiKey = getApiKey()
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs
    ?? (stream ? DEFAULT_STREAM_TIMEOUT_MS : DEFAULT_TIMEOUT_MS)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await proxyFetch(DEEPSEEK_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(options, stream)),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`DeepSeek request failed: ${response.status} ${detail.slice(0, 200)}`)
    }

    return { response, clearTimeout: () => clearTimeout(timeout) }
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

export async function deepseekChatCompletion(options: DeepSeekChatOptions): Promise<string> {
  const { response, clearTimeout: clearRequestTimeout } = await createDeepSeekResponse(options, false)

  try {
    const result = await response.json() as DeepSeekResponse
    const content = result.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('DeepSeek response did not include answer content')
    }
    return content
  } finally {
    clearRequestTimeout()
  }
}

/** Yields text deltas from DeepSeek SSE stream. */
export async function* deepseekChatCompletionStream(
  options: DeepSeekChatOptions,
): AsyncGenerator<string> {
  const { response, clearTimeout: clearRequestTimeout } = await createDeepSeekResponse(options, true)

  try {
    if (!response.body) {
      throw new Error('DeepSeek stream response body is empty')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const payload = trimmed.slice(5).trim()
        if (!payload || payload === '[DONE]') continue

        let chunk: DeepSeekStreamChunk
        try {
          chunk = JSON.parse(payload) as DeepSeekStreamChunk
        } catch {
          continue
        }

        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) yield delta
      }
    }
  } finally {
    clearRequestTimeout()
  }
}
