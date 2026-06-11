import { VibeCoding } from '@/components/home/VibeCoding'

export const metadata = {
  title: '草本集 · SpiritGarden',
  description: 'Vibe Coding 实验手札与灵感记录。',
}

export default function VibePage() {
  return (
    <div className="spirit-garden-content sg-subpage sg-subpage--herb">
      <VibeCoding />
    </div>
  )
}
