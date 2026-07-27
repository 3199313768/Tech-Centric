/**
 * DeepSeek Chat Completions 客户端。
 * 非流式返回完整字符串；流式按 SSE `data:` 帧 yield 文本增量。
 * RAG 侧经 `streamRagAnswer` 再包装为自家 `RagSseEvent`。
 */
import { proxyFetch } from '@/lib/rag/proxyFetch'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEFAULT_MODEL = 'deepseek-v4-flash'
/** 非流式默认超时。 */
const DEFAULT_TIMEOUT_MS = 30_000
/** 流式默认超时（生成更长，放宽）。 */
const DEFAULT_STREAM_TIMEOUT_MS = 60_000

export type DeepSeekMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type DeepSeekChatOptions = {
  messages: DeepSeekMessage[]
  temperature?: number
  /** 需要结构化 JSON 时传 `{ type: 'json_object' }`。 */
  responseFormat?: { type: 'json_object' }
  timeoutMs?: number
  /** 调用方取消（如用户中止 RAG 请求）会联动 abort。 */
  signal?: AbortSignal
}

/** 非流式响应形状（只用到 message.content）。 */
interface DeepSeekResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

/** 流式 chunk 形状（只用到 delta.content）。 */
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
    // 关闭 thinking，避免延迟与多余 token。
    thinking: { type: 'disabled' as const },
    messages: options.messages,
    stream,
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
  }
}

/**
 * 发起 DeepSeek 请求：超时 + 外部 signal 合并到同一 AbortController。
 * 成功时返回 `{ response, cleanup }`；调用方负责在读完 body 后 `cleanup()`。
 * 建连失败会在本函数内 cleanup 并抛错。
 */
async function createDeepSeekResponse(options: DeepSeekChatOptions, stream: boolean) {
  const apiKey = getApiKey()
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs
    ?? (stream ? DEFAULT_STREAM_TIMEOUT_MS : DEFAULT_TIMEOUT_MS)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  const abortFromCaller = () => controller.abort(options.signal?.reason)
  if (options.signal?.aborted) {
    abortFromCaller()
  } else {
    options.signal?.addEventListener('abort', abortFromCaller, { once: true })
  }
  const cleanup = () => {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', abortFromCaller)
  }

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

    return { response, cleanup }
  } catch (error) {
    cleanup()
    throw error
  }
}

/** 非流式补全：等待完整 JSON，返回 trim 后的 answer 文本。 */
export async function deepseekChatCompletion(options: DeepSeekChatOptions): Promise<string> {
  const { response, cleanup } = await createDeepSeekResponse(options, false)

  try {
    const result = await response.json() as DeepSeekResponse
    const content = result.choices?.[0]?.message?.content?.trim()
    if (!content) {
      throw new Error('DeepSeek response did not include answer content')
    }
    return content
  } finally {
    cleanup()
  }
}

/**
 * 流式补全：解析上游 SSE，yield 文本增量。
 * - 按行缓冲，半截帧留在 buffer
 * - 跳过 `[DONE]` 与非法 JSON
 * - finally 里 cancel reader + cleanup 超时/监听
 */
export async function* deepseekChatCompletionStream(
  options: DeepSeekChatOptions,
): AsyncGenerator<string> {
  const { response, cleanup } = await createDeepSeekResponse(options, true)
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  try {
    if (!response.body) {
      throw new Error('DeepSeek stream response body is empty')
    }

    reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      // 最后一段可能不完整，留到下次拼。
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
    try {
      await reader?.cancel()
    } catch {
      // 上游可能已关闭流。
    }
    cleanup()
  }
}
