'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="sg-modal-panel sg-kb-login-panel">
      <h2 className="sg-modal-title">身份验证</h2>
      <p className="sg-modal-subtitle">
        私有知识库，请使用 Supabase 后台创建的账号登录
      </p>

      <form onSubmit={handleLogin}>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="kb-email">
            邮箱
          </label>
          <input
            id="kb-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sg-form-input"
            required
          />
        </div>
        <div className="sg-form-field">
          <label className="sg-form-label" htmlFor="kb-password">
            密码
          </label>
          <input
            id="kb-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="sg-form-input"
            required
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
            {loading ? '验证中...' : '进入知识库'}
          </button>
        </div>
      </form>
    </div>
  )
}
