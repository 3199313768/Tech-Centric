import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { SITE_ROLE } from '@/lib/auth/roles'
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

export async function requireApiSuperAdmin(): Promise<
  { user: User; response: null } | { user: null; response: NextResponse }
> {
  const profile = await getSessionProfile()
  if (!profile) {
    return {
      user: null,
      response: NextResponse.json({ error: '请先登录' }, { status: 401 }),
    }
  }
  if (profile.role !== SITE_ROLE.super_admin) {
    return {
      user: null,
      response: NextResponse.json({ error: '无权限' }, { status: 403 }),
    }
  }
  return { user: profile.user, response: null }
}
