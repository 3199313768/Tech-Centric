import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { isSiteRole, type SiteRole } from '@/lib/auth/roles'

export type SessionProfile = {
  user: User
  role: SiteRole
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data || !isSiteRole(data.role)) return null
  return { user, role: data.role }
}

export async function getSessionRole(): Promise<SiteRole | null> {
  const profile = await getSessionProfile()
  return profile?.role ?? null
}

export type SessionState =
  | { kind: 'anonymous' }
  | { kind: 'incomplete'; email: string }
  | { kind: 'ready'; profile: SessionProfile }

export async function getSessionState(): Promise<SessionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { kind: 'anonymous' }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data || !isSiteRole(data.role)) {
    return { kind: 'incomplete', email: user.email ?? '' }
  }

  return { kind: 'ready', profile: { user, role: data.role } }
}
