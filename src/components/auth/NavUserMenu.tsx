'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function truncateEmail(email: string, max = 20): string {
  if (email.length <= max) return email
  return `${email.slice(0, max - 3)}…`
}

export function NavUserMenu({ email }: { email: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        setError(signOutError.message)
        return
      }
      router.replace('/login')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '登出失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sg-nav-user">
      {email ? (
        <span className="sg-nav-user__email" title={email}>
          {truncateEmail(email)}
        </span>
      ) : null}
      <button
        type="button"
        className="sg-btn sg-btn--ghost sg-nav-user__logout"
        onClick={handleLogout}
        disabled={loading}
        aria-label="登出"
      >
        登出
      </button>
      {error ? (
        <span className="sg-kb-error sg-kb-error--inline" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
