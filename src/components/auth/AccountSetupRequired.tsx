'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AccountSetupRequired({ email }: { email: string }) {
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
    <div className="spirit-garden-content sg-subpage sg-kb-login-wrap">
      <div className="sg-modal-panel sg-kb-login-panel">
        <h2 className="sg-modal-title">账号未就绪</h2>
        <p className="sg-modal-subtitle">账号未就绪，请联系管理员</p>
        {email ? (
          <p className="sg-modal-subtitle" title={email}>
            当前账号：{email}
          </p>
        ) : null}
        {error ? (
          <div className="sg-kb-error sg-kb-error--inline" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        <div className="sg-modal-actions">
          <button
            type="button"
            className="sg-btn sg-btn--primary"
            onClick={handleLogout}
            disabled={loading}
            aria-label="登出"
          >
            {loading ? '登出中...' : '登出'}
          </button>
        </div>
      </div>
    </div>
  )
}
