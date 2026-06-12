import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function requireApiUser(): Promise<
  { user: User; response: null } | { user: null; response: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, response: NextResponse.json({ error: '请先登录' }, { status: 401 }) }
  }

  return { user, response: null }
}
