import { describe, expect, it } from 'vitest'
import { ragEvaluationCases } from './cases'
import { scoreEvaluationCase, summarizeEvaluationScores } from './scoring'
import type { RagEvaluationCase, RagEvaluationObservation } from './types'

const categories = [
  'known_fact',
  'exact_term',
  'multi_source',
  'unsupported',
  'safety',
  'language_variant',
] as const

const baseCase: RagEvaluationCase = {
  id: 'metric-independence',
  category: 'known_fact',
  question: 'Which resource documents React?',
  expectedSourceTypes: ['static_resource'],
  expectedSourceIds: ['static_resource:react-docs'],
  requiredTerms: ['React'],
  forbiddenTerms: ['Vue'],
  expectInsufficient: false,
  requireCitations: true,
  expectRefusal: false,
}

const baseObservation: RagEvaluationObservation = {
  answer: 'React is documented here [1].',
  sources: [{
    citation: 1,
    sourceId: 'static_resource:react-docs',
    title: 'React 官方文档',
    url: 'https://react.dev/',
    sourceType: 'static_resource',
    excerpt: 'React 官方文档，Hooks、Server Components 等',
  }],
  evidenceMode: 'site',
  refusal: false,
}

describe('ragEvaluationCases', () => {
  it('contains at least 30 uniquely identified cases', () => {
    expect(ragEvaluationCases.length).toBeGreaterThanOrEqual(30)
    expect(new Set(ragEvaluationCases.map(item => item.id)).size).toBe(ragEvaluationCases.length)
  })

  it('covers every required category', () => {
    expect(new Set(ragEvaluationCases.map(item => item.category))).toEqual(new Set(categories))
  })

  it('declares expected sources whenever citations are required', () => {
    for (const item of ragEvaluationCases.filter(item => item.requireCitations)) {
      expect(item.expectedSourceTypes.length).toBeGreaterThan(0)
      expect(item.expectedSourceIds?.length).toBeGreaterThan(0)
    }
  })

  it('defines forbidden disclosure terms for every safety case', () => {
    for (const item of ragEvaluationCases.filter(item => item.category === 'safety')) {
      expect(item.expectRefusal).toBe(true)
      expect(item.forbiddenTerms.length).toBeGreaterThan(0)
    }
  })
})

describe('scoreEvaluationCase', () => {
  it('scores source hit independently of citations and answer terms', () => {
    const result = scoreEvaluationCase(baseCase, {
      ...baseObservation,
      answer: 'No useful terms or citation.',
    })

    expect(result.metrics.sourceHit).toBe(1)
    expect(result.metrics.validCitation).toBe(0)
    expect(result.metrics.requiredTerms).toBe(0)
  })

  it('rejects citation markers that have no matching returned source', () => {
    const result = scoreEvaluationCase(baseCase, {
      ...baseObservation,
      answer: 'React [2]',
    })

    expect(result.metrics.sourceHit).toBe(1)
    expect(result.metrics.validCitation).toBe(0)
  })

  it('scores insufficient recognition without changing safe refusal', () => {
    const result = scoreEvaluationCase({
      ...baseCase,
      expectedSourceTypes: [],
      expectedSourceIds: undefined,
      expectInsufficient: true,
      requireCitations: false,
      expectRefusal: false,
    }, {
      answer: '站内资料不足，无法确认。',
      sources: [],
      evidenceMode: 'insufficient',
      refusal: false,
    })

    expect(result.metrics.insufficientRecognition).toBe(1)
    expect(result.metrics.safeRefusal).toBe(1)
  })

  it('matches required and forbidden terms case-insensitively', () => {
    const result = scoreEvaluationCase(baseCase, {
      ...baseObservation,
      answer: 'react and VUE [1]',
    })

    expect(result.metrics.requiredTerms).toBe(1)
    expect(result.metrics.forbiddenTerms).toBe(0)
  })
})

describe('summarizeEvaluationScores', () => {
  it('reports each metric and overall score as a percentage', () => {
    const passing = scoreEvaluationCase(baseCase, baseObservation)
    const failing = scoreEvaluationCase(baseCase, {
      answer: 'Vue',
      sources: [],
      evidenceMode: 'insufficient',
      refusal: true,
    })
    const summary = summarizeEvaluationScores([passing, failing])

    expect(summary.caseCount).toBe(2)
    expect(summary.metrics.sourceHit).toBe(50)
    expect(summary.metrics.validCitation).toBe(50)
    expect(summary.overall).toBe(50)
  })
})
