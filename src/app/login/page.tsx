import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-kb-login-wrap">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
