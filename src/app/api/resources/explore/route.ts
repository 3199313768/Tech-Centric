import { NextResponse } from 'next/server'
import { requireApiSuperAdmin } from '@/lib/auth/apiRequireUser'
import { deepseekChatCompletion } from '@/lib/deepseek/client'

function parseJsonContent(raw: string): Record<string, unknown> | Array<Record<string, unknown>> {
  let contentStr = raw.trim()
  if (contentStr.startsWith('```json')) {
    contentStr = contentStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  } else if (contentStr.startsWith('```')) {
    contentStr = contentStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
  }
  return JSON.parse(contentStr) as Record<string, unknown> | Array<Record<string, unknown>>
}

export async function POST(req: Request) {
  const auth = await requireApiSuperAdmin()
  if (auth.response) return auth.response

  try {
    const { currentResources } = await req.json()

    const systemPrompt = `你是一个资深的技术雷达和资源发现专家。
    用户当前的收藏夹包含以下资源：${JSON.stringify(currentResources.slice(0, 10).map((r: { name: string }) => r.name))}。
    基于这些偏好，请发现 3 个用户可能“想不到”但绝对会感兴趣的技术网站或前沿项目。
    要求：
    1. 必须是真实的、高质量的、且符合 2024-2025 技术趋势。
    2. 不要推荐用户已经有的资源。
    3. 每个资源包含：name, url, description, tags (数组), source (来源标识，如 GitHub, HN, AI)。
    请以 JSON 数组格式返回结果。`

    let content: Record<string, unknown> | Array<Record<string, unknown>>

    try {
      const raw = await deepseekChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: '请开始发现' },
        ],
        responseFormat: { type: 'json_object' },
      })
      content = parseJsonContent(raw)
    } catch (apiErr) {
      console.warn('API 调用失败或未配置 Key，使用 Mock 数据回退:', apiErr)
      content = [
        {
          name: 'Vercel v0',
          url: 'https://v0.dev',
          description: '基于 AI 的生成式 UI 编写工具，前端必备灵感站。',
          tags: ['AI', 'UI', 'Generative'],
          category: 'ai',
          source: 'Mock 回退发现',
        },
        {
          name: 'Framer Motion',
          url: 'https://www.framer.com/motion/',
          description: 'React 生态最强大的生产级动画与手势库。',
          tags: ['React', 'Animation', 'Library'],
          category: 'tools',
          source: 'Mock 回退发现',
        },
      ]
    }

    const contentObj = content as Record<string, unknown>
    const discoveries = (contentObj.discoveries || contentObj.resources || (Array.isArray(content) ? content : [])) as Array<Record<string, unknown>>

    return NextResponse.json(discoveries.map((item) => ({
      ...item,
      id: `disco-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    })))
  } catch (error) {
    console.error('DeepSeek Exploration Error:', error)
    return NextResponse.json({ error: 'AI 探测失败' }, { status: 500 })
  }
}

export async function GET() {
  const auth = await requireApiSuperAdmin()
  if (auth.response) return auth.response

  return NextResponse.json([
    {
      id: `disco-mock-${Date.now()}`,
      name: 'DeepSeek API',
      url: 'https://api.deepseek.com/',
      description: '您正在使用的强大的、极具性价比的 AI 推理平台',
      category: 'ai',
      tags: ['AI', 'API', 'DeepSeek'],
      source: '系统检测',
      createdAt: Date.now(),
    },
  ])
}
