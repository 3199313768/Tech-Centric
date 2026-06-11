import dotenv from 'dotenv'
import {
  EMBEDDING_DIMENSIONS,
  createEmbedding,
  getEmbeddingModel,
  getOpenAIBaseUrl,
} from '../../src/lib/rag/embedding'
import { getProxyUrl, isConnectTimeoutError, proxyFetch } from '../../src/lib/rag/proxyFetch'

dotenv.config({ path: '.env.local', override: true })
dotenv.config({ override: true })

function fail(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function ok(message: string) {
  console.log(`✓ ${message}`)
}

function isOfficialOpenAiBaseUrl(baseUrl: string) {
  return baseUrl === 'https://api.openai.com/v1'
}

function formatNetworkHelp(baseUrl: string) {
  const lines = [
    '当前网络无法连接 OpenAI API（Connect Timeout）。',
    '',
    '若使用官方地址 https://api.openai.com/v1，需要本机代理，例如 Clash 默认端口：',
    '  export HTTPS_PROXY=http://127.0.0.1:7890',
    '  export HTTP_PROXY=http://127.0.0.1:7890',
    '  npm run rag:check',
    '',
    '或在 .env.local 增加（按你的代理端口修改）：',
    '  HTTPS_PROXY=http://127.0.0.1:7890',
  ]

  if (isOfficialOpenAiBaseUrl(baseUrl)) {
    return lines.join('\n')
  }

  return [
    ...lines,
    '',
    '若不想走代理，可改用支持 text-embedding-3-small 的 OpenAI 兼容中转（OneAPI 等）。',
  ].join('\n')
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    fail('OPENAI_API_KEY 未配置')
  }

  const baseUrl = getOpenAIBaseUrl()
  const model = getEmbeddingModel()
  const proxyUrl = getProxyUrl()

  console.log(`OpenAI 兼容地址: ${baseUrl}`)
  console.log(`Embedding 模型: ${model}`)
  if (proxyUrl) {
    console.log(`HTTP 代理: ${proxyUrl}`)
  } else if (isOfficialOpenAiBaseUrl(baseUrl)) {
    console.warn('⚠ 使用官方 OpenAI 地址但未配置 HTTPS_PROXY，国内网络通常会连接超时')
  }
  console.log('')

  let modelsResponse: Awaited<ReturnType<typeof proxyFetch>>
  try {
    modelsResponse = await proxyFetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
  } catch (error) {
    if (isConnectTimeoutError(error)) {
      fail(formatNetworkHelp(baseUrl))
    }
    throw error
  }

  if (!modelsResponse.ok) {
    const detail = await modelsResponse.text()
    fail(`无法访问 ${baseUrl}/models: HTTP ${modelsResponse.status} ${detail.slice(0, 200)}`)
  }

  ok(`OpenAI API 可达 (${baseUrl})`)

  const modelsPayload = await modelsResponse.json() as { data?: Array<{ id?: string }> }
  const modelIds = (modelsPayload.data || []).map(item => item.id).filter(Boolean) as string[]
  const embeddingModels = modelIds.filter(id => /embed/i.test(id))

  if (embeddingModels.length > 0) {
    ok(`模型列表含 embedding 模型: ${embeddingModels.join(', ')}`)
  } else if (modelIds.length > 0) {
    console.warn(`⚠ /models 未列出 embedding 模型（共 ${modelIds.length} 个）。将直接探测 /embeddings …`)
  }

  if (modelIds.length > 0 && !modelIds.includes(model) && embeddingModels.length > 0) {
    console.warn(`⚠ 当前 EMBEDDING_MODEL=${model} 不在 /models 列表中，仍尝试调用 /embeddings`)
  }

  try {
    const embedding = await createEmbedding('RAG embedding connectivity check')
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      fail(`向量维度为 ${embedding.length}，需要 ${EMBEDDING_DIMENSIONS}（与 Supabase pgvector 一致）`)
    }
    ok(`Embedding 调用成功 (${model} → ${embedding.length} 维)`)
  } catch (error) {
    if (isConnectTimeoutError(error)) {
      fail(formatNetworkHelp(baseUrl))
    }

    const message = error instanceof Error ? error.message : String(error)
    fail([
      `Embedding 调用失败: ${message}`,
      '',
      '若使用 OneAPI / New API 中转，需单独配置 embedding 渠道：',
      '  - 渠道类型: OpenAI',
      '  - 模型: text-embedding-3-small（须为 1536 维）',
      '',
      '若使用官方 OpenAI，请配置 HTTPS_PROXY 后重试。',
    ].join('\n'))
  }

  console.log('')
  console.log('环境检查通过，可执行: npm run rag:index')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
