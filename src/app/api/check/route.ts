import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    
    // SSRF 基础防护：拦截本地与内网探测
    try {
      const urlObj = new URL(normalizedUrl)
      const host = urlObj.hostname
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      ) {
        return NextResponse.json({ ok: false, error: 'SSRF Protection' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid URL format' }, { status: 400 })
    }

    // 使用 fetch 发送 HEAD 请求检测链接是否有效
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(normalizedUrl, { 
        method: 'HEAD', 
        signal: controller.signal,
        cache: 'no-store'
      })
      clearTimeout(timeout)
      
      return NextResponse.json({ 
        ok: response.ok, 
        status: response.status,
        statusText: response.statusText
      })
    } catch (e) {
      clearTimeout(timeout)
      // 如果 HEAD 失败，尝试 GET（有些服务器禁止 HEAD）
      const getResponse = await fetch(normalizedUrl, { 
        method: 'GET', 
        signal: AbortSignal.timeout(5000), // Next.js 15+ 语法
        cache: 'no-store'
      })
      return NextResponse.json({ 
        ok: getResponse.ok, 
        status: getResponse.status 
      })
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "未知错误" }, { status: 200 })
  }
}
