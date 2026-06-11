import type { ResourceItem } from '@/data/resources/initialResources'
import { RESOURCE_CANDIDATE_KEY } from '@/lib/resources/constants'

export function loadResourceCandidates(): ResourceItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RESOURCE_CANDIDATE_KEY)
    return raw ? (JSON.parse(raw) as ResourceItem[]) : []
  } catch {
    return []
  }
}

export function saveResourceCandidates(items: ResourceItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(RESOURCE_CANDIDATE_KEY, JSON.stringify(items))
}

export function generateResourceId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
