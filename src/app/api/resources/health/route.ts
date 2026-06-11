import { NextResponse } from 'next/server'
import { checkResourceLinks } from '@/lib/resources/linkHealth'
import { createClient } from '@/lib/supabase/server'

const MAX_RESOURCES = 60

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('resources')
    .select('id, name, url')
    .order('name')
    .limit(MAX_RESOURCES)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const resources = data ?? []
  const results = await checkResourceLinks(resources)

  const broken = results.filter((item) => item.status !== 'ok')
  const okCount = results.length - broken.length

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    total: results.length,
    okCount,
    brokenCount: broken.length,
    results,
  })
}
