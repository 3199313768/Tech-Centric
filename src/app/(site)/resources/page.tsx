import { ResourceLinks } from '@/components/home/ResourceLinks'

export const metadata = {
  title: '资源库 · SpiritGarden',
  description: '学习、工具与设计相关的精选资源链接。',
}

export default function ResourcesPage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--library">
      <ResourceLinks />
    </div>
  )
}
