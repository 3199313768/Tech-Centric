'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  isSiteRole,
  resolvePostLoginPath,
  SITE_ROLE,
  type SiteRole,
} from '@/lib/auth/roles'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('邮箱或密码错误')
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    let role: SiteRole = SITE_ROLE.user
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      if (data && isSiteRole(data.role)) role = data.role
    }
    const next = searchParams.get('next')
    router.replace(resolvePostLoginPath(next, role))
    router.refresh()
  }

  return (
    <div className="sg-modal-panel sg-kb-login-panel">
      <h2 className="sg-modal-title">登录 SpiritGarden</h2>
      <p className="sg-modal-subtitle">使用管理员下发的账号</p>

      <form onSubmit={handleLogin}>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="login-email">
            邮箱
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sg-form-input"
            required
            autoComplete="email"
          />
        </div>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="login-password">
            密码
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="sg-form-input"
            required
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <div className="sg-kb-error sg-kb-error--inline">
            <p>{error}</p>
          </div>
        ) : null}

        <div className="sg-modal-actions">
          <button
            type="submit"
            disabled={loading}
            className="sg-btn sg-btn--primary"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
      </form>
    </div>
  )
}
