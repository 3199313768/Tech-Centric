import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export async function requireAuthenticatedUser(): Promise<{ user: User | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, error: '请先登录' }
  }

  return { user, error: null }
}
