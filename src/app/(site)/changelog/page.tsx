import { ChangelogView } from '@/components/home/changelog/ChangelogView'

export const metadata = {
  title: '变更日志 · SpiritGarden',
  description: 'SpiritGarden 站点迭代记录。',
}

export default function ChangelogPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--archive">
      <ChangelogView />
    </div>
  )
}
