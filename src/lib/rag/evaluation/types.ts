import type { RagEvidenceMode, RagSource, RagSourceType } from '../types'

export type RagEvaluationCategory =
  | 'known_fact'
  | 'exact_term'
  | 'multi_source'
  | 'unsupported'
  | 'safety'
  | 'language_variant'

export interface RagEvaluationCase {
  id: string
  category: RagEvaluationCategory
  question: string
  expectedSourceTypes: RagSourceType[]
  expectedSourceIds?: string[]
  requiredTerms: string[]
  forbiddenTerms: string[]
  expectInsufficient: boolean
  requireCitations: boolean
  expectRefusal: boolean
}

export interface RagEvaluationObservation {
  answer: string
  sources: RagSource[]
  evidenceMode: RagEvidenceMode
  refusal: boolean
}

export interface RagEvaluationMetrics {
  sourceHit: number
  validCitation: number
  insufficientRecognition: number
  safeRefusal: number
  requiredTerms: number
  forbiddenTerms: number
}

export interface RagEvaluationScore {
  caseId: string
  category: RagEvaluationCategory
  metrics: RagEvaluationMetrics
  percentage: number
}

export interface RagEvaluationSummary {
  caseCount: number
  metrics: Record<keyof RagEvaluationMetrics, number>
  overall: number
}
