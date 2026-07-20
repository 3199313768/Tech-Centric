import { proxyFetch } from './proxyFetch'

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536
const EMBEDDING_TIMEOUT_MS = 15_000
const EMBEDDING_MAX_ATTEMPTS = 3

interface OpenAIEmbeddingResponse {
  data: Array<{ embedding: number[] }>
}

export function getOpenAIBaseUrl() {
  return (process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/$/, '')
}

export function getEmbeddingsUrl() {
  return `${getOpenAIBaseUrl()}/embeddings`
}

export function getEmbeddingModel() {
  return process.env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL
}

function isRetryableEmbeddingError(error: unknown) {
  if (!(error instanceof Error)) return false
  if (error.name === 'AbortError') return true
  if (/timeout|fetch failed|ECONNRESET|ETIMEDOUT|UND_ERR/i.test(error.message)) return true
  const cause = error.cause as { code?: string } | undefined
  return Boolean(cause?.code && /TIMEOUT|ECONNRESET|UND_ERR|ENOTFOUND/i.test(cause.code))
}

async function requestEmbedding(apiKey: string, input: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS)

  try {
    const response = await proxyFetch(getEmbeddingsUrl(), {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: getEmbeddingModel(),
        input,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`OpenAI embedding request failed: ${response.status} ${detail.slice(0, 200)}`)
    }

    const result = await response.json() as OpenAIEmbeddingResponse
    const embedding = result.data[0]?.embedding
    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`OpenAI embedding response did not include a ${EMBEDDING_DIMENSIONS}-dimension vector`)
    }

    return embedding
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Embedding 请求超时（>${EMBEDDING_TIMEOUT_MS / 1000}s）：${getEmbeddingsUrl()}`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function createEmbedding(input: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  let lastError: unknown
  for (let attempt = 1; attempt <= EMBEDDING_MAX_ATTEMPTS; attempt++) {
    try {
      return await requestEmbedding(apiKey, input)
    } catch (error) {
      lastError = error
      const retryable = isRetryableEmbeddingError(error)
      if (!retryable || attempt === EMBEDDING_MAX_ATTEMPTS) break
      console.warn(`Embedding attempt ${attempt} failed, retrying…`, error)
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
    }
  }

  throw lastError
}
