import { skillsDetail } from '@/data/site/personal'
import { createClient } from '@/lib/supabase/server'

export interface SoulMeterItem {
  label: string
  value: number
}

const FALLBACK_METERS: SoulMeterItem[] = [
  { label: '创造力能量', value: 94 },
  { label: '咖啡因法力值', value: 62 },
  { label: '内心宁静度', value: 100 },
]

function avgFrontendProficiency(): number {
  const items = skillsDetail.filter((skill) => skill.category === 'frontend')
  if (!items.length) return 94
  return Math.round(items.reduce((sum, skill) => sum + skill.proficiency, 0) / items.length)
}

function clampMeter(value: number, min = 24, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

export async function fetchHomeSoulMeters(): Promise<SoulMeterItem[]> {
  try {
    const supabase = await createClient()
    const creativityBase = avgFrontendProficiency()

    const [skillsResult, vibeResult, projectResult, authResult] = await Promise.all([
      supabase.from('ai_skills').select('id', { count: 'exact', head: true }),
      supabase.from('vibe_coding').select('id', { count: 'exact', head: true }),
      supabase.from('all_projects').select('id', { count: 'exact', head: true }).eq('is_public', true),
      supabase.auth.getUser(),
    ])

    const skillCount = skillsResult.count ?? 0
    const vibeCount = vibeResult.count ?? 0
    const projectCount = projectResult.count ?? 0

    let kbCount = 0
    const userId = authResult.data.user?.id
    if (userId) {
      const { count } = await supabase
        .from('kb_records')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
      kbCount = count ?? 0
    }

    const creativity = clampMeter(
      creativityBase * 0.72 + skillCount * 4 + projectCount * 3,
    )
    const caffeine = clampMeter(34 + vibeCount * 11, 28)
    const serenity = userId ? clampMeter(26 + kbCount * 6, 20) : 100

    return [
      { label: '创造力能量', value: creativity },
      { label: '咖啡因法力值', value: caffeine },
      { label: '内心宁静度', value: serenity },
    ]
  } catch {
    return FALLBACK_METERS
  }
}

export type HeroSeason = 'spring' | 'summer' | 'autumn' | 'winter'

export function getHeroSeason(month = new Date().getMonth()): HeroSeason {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}
