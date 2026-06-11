import { NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'

export async function POST(req: Request) {
  try {
    const { currentResources } = await req.json()
    
    // 构建 Prompt：告诉 AI 用户的背景并要求推荐
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
      const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: '请开始发现' }
          ],
          response_format: { type: 'json_object' }
        })
      })

      const result = await response.json()
      if (!result.choices || !result.choices[0]) {
        throw new Error('AI 返回结果为空')
      }

      let contentStr = result.choices[0].message.content.trim()
      if (contentStr.startsWith('```json')) {
        contentStr = contentStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (contentStr.startsWith('```')) {
        contentStr = contentStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }
      
      content = JSON.parse(contentStr)
    } catch (apiErr) {
      console.warn('API 调用失败或未配置 Key，使用 Mock 数据回退:', apiErr)
      content = [
        {
          name: 'Vercel v0',
          url: 'https://v0.dev',
          description: '基于 AI 的生成式 UI 编写工具，前端必备灵感站。',
          tags: ['AI', 'UI', 'Generative'],
          category: 'ai',
          source: 'Mock 回退发现'
        },
        {
          name: 'Framer Motion',
          url: 'https://www.framer.com/motion/',
          description: 'React 生态最强大的生产级动画与手势库。',
          tags: ['React', 'Animation', 'Library'],
          category: 'tools',
          source: 'Mock 回退发现'
        }
      ]
    }
    
    // 处理可能的嵌套结构
    const contentObj = content as Record<string, unknown>;
    const discoveries = (contentObj.discoveries || contentObj.resources || (Array.isArray(content) ? content : [])) as Array<Record<string, unknown>>

    return NextResponse.json(discoveries.map((item) => ({
      ...item,
      id: `disco-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now()
    })))

  } catch (error) {
    console.error('DeepSeek Exploration Error:', error)
    return NextResponse.json({ error: 'AI 探测失败' }, { status: 500 })
  }
}

// 兼容 GET 请求用于演示或回退
export async function GET() {
   // 暂时返回 Mock 数据，直到 POST 被正确调用
   return NextResponse.json([
     {
       id: `disco-mock-${Date.now()}`,
       name: 'DeepSeek API',
       url: 'https://api.deepseek.com/',
       description: '您正在使用的强大的、极具性价比的 AI 推理平台',
       category: 'ai',
       tags: ['AI', 'API', 'DeepSeek'],
       source: '系统检测',
       createdAt: Date.now()
     }
   ])
}
