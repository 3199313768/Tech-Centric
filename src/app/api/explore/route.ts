import { NextResponse } from 'next/server'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1'

export async function POST(req: Request) {
  try {
    const { currentResources } = await req.json()
    
    // 构建 Prompt：告诉 AI 用户的背景并要求推荐
    const systemPrompt = `你是一个资深的技术雷达和资源发现专家。
    用户当前的收藏夹包含以下资源：${JSON.stringify(currentResources.slice(0, 10).map((r: any) => r.name))}。
    基于这些偏好，请发现 3 个用户可能“想不到”但绝对会感兴趣的技术网站或前沿项目。
    要求：
    1. 必须是真实的、高质量的、且符合 2024-2025 技术趋势。
    2. 不要推荐用户已经有的资源。
    3. 每个资源包含：name, url, description, tags (数组), source (来源标识，如 GitHub, HN, AI)。
    请以 JSON 数组格式返回结果。`

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
      console.error('DeepSeek Error Result:', result)
      throw new Error('AI 返回结果为空')
    }

    let contentStr = result.choices[0].message.content.trim()
    // 自动剥离可能的 markdown 代码块标识
    if (contentStr.startsWith('```json')) {
      contentStr = contentStr.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (contentStr.startsWith('```')) {
      contentStr = contentStr.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    let content: any
    try {
      content = JSON.parse(contentStr)
    } catch (parseErr) {
      console.error('JSON Parse Error. Content:', contentStr)
      throw new Error('AI 返回数据格式错误')
    }
    
    // 处理可能的嵌套结构
    const discoveries = content.discoveries || content.resources || (Array.isArray(content) ? content : [])

    return NextResponse.json(discoveries.map((item: any) => ({
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
