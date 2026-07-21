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
}

export type RagEvaluationSignal = 0 | 1 | null

export interface RagEvaluationMetrics {
  sourceHit: RagEvaluationSignal
  validCitation: RagEvaluationSignal
  insufficientRecognition: RagEvaluationSignal
  safeRefusal: RagEvaluationSignal
  requiredTermsMatched: RagEvaluationSignal
  forbiddenTermsAvoided: RagEvaluationSignal
}

export interface RagEvaluationScore {
  caseId: string
  category: RagEvaluationCategory
  metrics: RagEvaluationMetrics
  percentage: number | null
}

export interface RagEvaluationSummary {
  caseCount: number
  metrics: Record<keyof RagEvaluationMetrics, number | null>
  overall: number | null
}
