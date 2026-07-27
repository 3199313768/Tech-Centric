import { KnowledgeNav } from '@/components/knowledge/shell/KnowledgeNav'
import { SpiritAtmosphereShell } from '@/components/spirit/shell/SpiritAtmosphereShell'
import { getSessionProfile } from '@/lib/auth/getSessionProfile'
import { redirect } from 'next/navigation'

export default async function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getSessionProfile()
  if (!profile) redirect('/login')

  return (
    <SpiritAtmosphereShell
      nav={<KnowledgeNav role={profile.role} email={profile.user.email ?? ''} />}
      role={profile.role}
    >
      {children}
    </SpiritAtmosphereShell>
  )
}
