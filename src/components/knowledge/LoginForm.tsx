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
    <div className="w-full max-w-sm mx-auto p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-sm">
      <h2 className="text-2xl font-semibold text-zinc-100 mb-2 text-center tracking-tight">身份验证</h2>
      <p className="text-zinc-500 text-xs text-center mb-8">
        私有知识库，请使用 Supabase 后台创建的账号登录
      </p>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">邮箱 (Email)</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm" 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">密码 (Password)</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm" 
            required 
          />
        </div>
        
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 mt-4 shadow-lg shadow-indigo-500/20"
        >
          {loading ? '验证中...' : '进入知识库'}
        </button>
      </form>
    </div>
  )
}
