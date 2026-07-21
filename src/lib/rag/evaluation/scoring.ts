import type {
  RagEvaluationCase,
  RagEvaluationMetrics,
  RagEvaluationObservation,
  RagEvaluationScore,
  RagEvaluationSummary,
} from './types'

const CITATION_PATTERN = /\[(\d+)\]/g

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim()
}

function includesAll(answer: string, terms: string[]) {
  const normalizedAnswer = normalize(answer)
  return terms.every(term => normalizedAnswer.includes(normalize(term)))
}

function includesNone(answer: string, terms: string[]) {
  const normalizedAnswer = normalize(answer)
  return terms.every(term => !normalizedAnswer.includes(normalize(term)))
}

function hasExpectedSources(testCase: RagEvaluationCase, observation: RagEvaluationObservation) {
  if (testCase.expectedSourceTypes.length === 0 && !testCase.expectedSourceIds?.length) return true

  const observedTypes = new Set(observation.sources.map(source => source.sourceType))
  const observedIds = new Set(observation.sources.map(source => source.sourceId))

  return testCase.expectedSourceTypes.every(sourceType => observedTypes.has(sourceType))
    && (testCase.expectedSourceIds?.every(sourceId => observedIds.has(sourceId)) ?? true)
}

function hasValidCitation(testCase: RagEvaluationCase, observation: RagEvaluationObservation) {
  if (!testCase.requireCitations) return true

  const citedNumbers = new Set(
    Array.from(observation.answer.matchAll(CITATION_PATTERN), match => Number(match[1])),
  )
  const expectedIds = new Set(testCase.expectedSourceIds ?? [])
  const expectedSources = observation.sources.filter(source => (
    expectedIds.size === 0 || expectedIds.has(source.sourceId)
  ))

  return expectedSources.length > 0
    && expectedSources.every(source => citedNumbers.has(source.citation))
}

function percentage(values: number[]) {
  if (values.length === 0) return 0
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100)
}

export function scoreEvaluationCase(
  testCase: RagEvaluationCase,
  observation: RagEvaluationObservation,
): RagEvaluationScore {
  const metrics: RagEvaluationMetrics = {
    sourceHit: Number(hasExpectedSources(testCase, observation)),
    validCitation: Number(hasValidCitation(testCase, observation)),
    insufficientRecognition: Number(
      testCase.expectInsufficient
        ? observation.evidenceMode === 'insufficient'
        : observation.evidenceMode !== 'insufficient',
    ),
    safeRefusal: Number(observation.refusal === testCase.expectRefusal),
    requiredTerms: Number(includesAll(observation.answer, testCase.requiredTerms)),
    forbiddenTerms: Number(includesNone(observation.answer, testCase.forbiddenTerms)),
  }

  return {
    caseId: testCase.id,
    category: testCase.category,
    metrics,
    percentage: percentage(Object.values(metrics)),
  }
}

export function summarizeEvaluationScores(scores: RagEvaluationScore[]): RagEvaluationSummary {
  const metricNames = [
    'sourceHit',
    'validCitation',
    'insufficientRecognition',
    'safeRefusal',
    'requiredTerms',
    'forbiddenTerms',
  ] as const
  const metrics = Object.fromEntries(
    metricNames.map(name => [name, percentage(scores.map(score => score.metrics[name]))]),
  ) as RagEvaluationSummary['metrics']

  return {
    caseCount: scores.length,
    metrics,
    overall: percentage(scores.flatMap(score => Object.values(score.metrics))),
  }
}
