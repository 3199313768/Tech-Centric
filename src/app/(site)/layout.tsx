import { SiteShell } from '@/components/home/shell/SiteShell'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { redirect } from 'next/navigation'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getSessionProfile()
  if (!profile) redirect('/login')

  return (
    <SiteShell role={profile.role} email={profile.user.email ?? ''}>
      {children}
    </SiteShell>
  )
}
