import { KnowledgeNav } from '@/components/knowledge/shell/KnowledgeNav'
import { SpiritAtmosphereShell } from '@/components/spirit/shell/SpiritAtmosphereShell'

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SpiritAtmosphereShell nav={<KnowledgeNav />}>{children}</SpiritAtmosphereShell>
}
