import { ProxyAgent, Agent, fetch as undiciFetch } from 'undici'

/** 直连 Agent：避开 Next 对全局 fetch 的包装，减少偶发挂死。 */
const directAgent = new Agent({
  connect: { timeout: 10_000 },
  bodyTimeout: 45_000,
  headersTimeout: 20_000,
})

export function getProxyUrl() {
  return process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY || null
}

export function isConnectTimeoutError(error: unknown) {
  if (!(error instanceof Error)) return false
  const cause = error.cause as { code?: string } | undefined
  return cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || /connect timeout/i.test(error.message)
}

/** 仅官方 OpenAI 需要本机代理；国内中转直连，避免 Clash 把请求拖死。 */
function shouldUseProxy(input: string) {
  try {
    const host = new URL(input).hostname
    return host === 'api.openai.com' || host.endsWith('.openai.com')
  } catch {
    return false
  }
}

export async function proxyFetch(input: string, init?: RequestInit): Promise<Response> {
  const proxyUrl = getProxyUrl()
  const useProxy = Boolean(proxyUrl && shouldUseProxy(input))
  const dispatcher = useProxy ? new ProxyAgent(proxyUrl as string) : directAgent

  const response = await undiciFetch(input, {
    ...init,
    dispatcher,
  } as Parameters<typeof undiciFetch>[1])

  return response as unknown as Response
}
