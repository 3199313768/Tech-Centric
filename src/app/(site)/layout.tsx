import { AccountSetupRequired } from '@/components/auth/AccountSetupRequired'
import { SiteShell } from '@/components/home/shell/SiteShell'
import { getSessionState } from '@/lib/auth/getSessionProfile'
import { redirect } from 'next/navigation'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const state = await getSessionState()
  if (state.kind === 'anonymous') redirect('/login')
  if (state.kind === 'incomplete') {
    return <AccountSetupRequired email={state.email} />
  }

  return (
    <SiteShell role={state.profile.role} email={state.profile.user.email ?? ''}>
      {children}
    </SiteShell>
  )
}
