import { LoginForm } from '@/components/knowledge/auth/LoginForm'
import { StudioDashboard } from '@/components/home/studio/StudioDashboard'
import { fetchStudioStats } from '@/lib/studio/queries'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: '工作台 · SpiritGarden',
  description: '站点所有者内容管理入口。',
}

export default async function StudioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="spirit-garden-content sg-subpage sg-subpage--workshop sg-kb-login-wrap">
        <LoginForm />
      </div>
    )
  }

  const stats = await fetchStudioStats(user.id)

  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--workshop">
      <StudioDashboard stats={stats} />
    </div>
  )
}
