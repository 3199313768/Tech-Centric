import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { SITE_ROLE } from '@/lib/auth/roles'

export async function requireAuthenticatedUser(): Promise<{
  user: User | null
  error: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: '请先登录' }
  }

  return { user, error: null }
}

export async function requireSuperAdmin(): Promise<{
  user: User | null
  error: string | null
}> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { user: null, error: '请先登录' }
  }
  if (profile.role !== SITE_ROLE.super_admin) {
    return { user: profile.user, error: '无权限' }
  }
  return { user: profile.user, error: null }
}
