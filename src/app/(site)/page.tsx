import { SpiritGardenHome } from '@/components/home/landing/SpiritGardenHome'
import { fetchFeaturedProject } from '@/lib/projects/featured'
import { fetchHomeSoulMeters, getHeroSeason } from '@/lib/site/homeStats'

export const metadata = {
  title: 'SpiritGarden · 数字庭院',
  description: '个人技术主页，代码与美学交织的数字庭院。',
}

export default async function HomePage() {
  const [featured, soulMeters] = await Promise.all([
    fetchFeaturedProject(),
    fetchHomeSoulMeters(),
  ])

  return (
    <SpiritGardenHome
      featured={featured}
      soulMeters={soulMeters}
      heroSeason={getHeroSeason()}
    />
  )
}
