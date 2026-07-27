import { NextResponse } from 'next/server'
import { requireApiSuperAdmin } from '@/lib/auth/apiRequireUser'
import { deepseekChatCompletion } from '@/lib/deepseek/client'

export async function POST(req: Request) {
  const auth = await requireApiSuperAdmin()
  if (auth.response) return auth.response

  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const systemPrompt = `你是一个专业的网页元数据解析专家。
    请分析以下 URL：${url}
    你的任务是生成该网站的：
    1. 标题 (name)：简洁有力。
    2. 描述 (description)：一句话概括核心功能，不超过 50 字。
    3. 分类 (category)：必须从以下选项中选择一个：learning, ai, tools, design, other。
    4. 标签 (tags)：3-5 个相关关键词。
    请以精简的 JSON 格式返回。`

    const raw = await deepseekChatCompletion({
      messages: [{ role: 'system', content: systemPrompt }],
      responseFormat: { type: 'json_object' },
    })
    const content = JSON.parse(raw) as Record<string, unknown>

    return NextResponse.json(content)
  } catch (error) {
    console.error('AI Autofill Error:', error)
    return NextResponse.json({ error: 'AI 填充失败' }, { status: 500 })
  }
}
