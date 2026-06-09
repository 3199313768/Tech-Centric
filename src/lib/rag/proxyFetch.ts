import { ProxyAgent, fetch as undiciFetch } from 'undici'

export function getProxyUrl() {
  return process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY || null
}

export function isConnectTimeoutError(error: unknown) {
  if (!(error instanceof Error)) return false
  const cause = error.cause as { code?: string } | undefined
  return cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || /connect timeout/i.test(error.message)
}

export async function proxyFetch(input: string, init?: RequestInit): Promise<Response> {
  const proxyUrl = getProxyUrl()
  if (!proxyUrl) {
    return fetch(input, init)
  }

  const dispatcher = new ProxyAgent(proxyUrl)
  const response = await undiciFetch(input, {
    ...init,
    dispatcher,
  } as Parameters<typeof undiciFetch>[1])

  return response as unknown as Response
}
