import { proxyFetch } from './proxyFetch'

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536
const EMBEDDING_TIMEOUT_MS = 15_000

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

export async function createEmbedding(input: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS)

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
  }).finally(() => clearTimeout(timeout))

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
}
