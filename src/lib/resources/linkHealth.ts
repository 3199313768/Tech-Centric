const CHECK_TIMEOUT_MS = 8000

export type LinkCheckStatus = 'ok' | 'broken' | 'timeout' | 'invalid'

export interface LinkCheckResult {
  id: string
  name: string
  url: string
  status: LinkCheckStatus
  statusCode?: number
  message?: string
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false
    }
    const hostname = parsed.hostname.toLowerCase()
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

async function probeUrl(url: string): Promise<{ ok: boolean; statusCode?: number; message?: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'SpiritGarden-LinkChecker/1.0' },
    })

    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'SpiritGarden-LinkChecker/1.0',
          Range: 'bytes=0-0',
        },
      })
    }

    return { ok: response.ok, statusCode: response.status }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, message: '请求超时' }
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : '检测失败',
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function checkResourceLink(
  id: string,
  name: string,
  url: string,
): Promise<LinkCheckResult> {
  if (!isSafeHttpUrl(url)) {
    return { id, name, url, status: 'invalid', message: '无效或不安全的 URL' }
  }

  const result = await probeUrl(url)

  if (result.ok) {
    return { id, name, url, status: 'ok', statusCode: result.statusCode }
  }

  if (result.message === '请求超时') {
    return { id, name, url, status: 'timeout', message: result.message }
  }

  return {
    id,
    name,
    url,
    status: 'broken',
    statusCode: result.statusCode,
    message: result.message ?? `HTTP ${result.statusCode ?? '错误'}`,
  }
}

export async function checkResourceLinks(
  resources: Array<{ id: string; name: string; url: string }>,
  concurrency = 4,
): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = []
  let index = 0

  async function worker(): Promise<void> {
    while (index < resources.length) {
      const current = resources[index]
      index += 1
      if (!current) continue
      results.push(await checkResourceLink(current.id, current.name, current.url))
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, resources.length) },
    () => worker(),
  )
  await Promise.all(workers)

  return results.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}
