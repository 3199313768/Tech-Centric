import { SiteShell } from '@/components/home/SiteShell'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
