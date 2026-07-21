import dotenv from 'dotenv'
import Module from 'node:module'
import path from 'node:path'

dotenv.config({ path: '.env.local', override: true })
dotenv.config({ override: true })

const requiredEnvironmentVariables = [
  'OPENAI_API_KEY',
  'DEEPSEEK_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

function registerPathAlias() {
  const moduleWithResolver = Module as typeof Module & {
    _resolveFilename: (
      request: string,
      parent: NodeModule | undefined,
      isMain: boolean,
      options?: { paths?: string[] },
    ) => string
  }
  const originalResolveFilename = moduleWithResolver._resolveFilename

  moduleWithResolver._resolveFilename = function resolveFilename(
    request,
    parent,
    isMain,
    options,
  ) {
    const resolvedRequest = request.startsWith('@/')
      ? path.join(process.cwd(), 'src', request.slice(2))
      : request
    return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options)
  }
}

function formatPercentage(value: number | null) {
  return value === null ? 'N/A' : `${value}%`
}

function formatSignal(value: 0 | 1 | null) {
  return value === null ? 'N/A' : String(value)
}

type EvaluationErrorCategory =
  | 'embedding-provider'
  | 'retrieval'
  | 'generation-provider'
  | 'aborted'
  | 'unknown'

function classifyEvaluationError(error: unknown): EvaluationErrorCategory {
  if (!(error instanceof Error)) return 'unknown'
  if (error.name === 'AbortError') return 'aborted'
  if (/^(?:OpenAI embedding|Embedding )/u.test(error.message)) {
    return 'embedding-provider'
  }
  if (/^RAG (?:vector |lexical )?retrieval/u.test(error.message)) {
    return 'retrieval'
  }
  if (/^DeepSeek /u.test(error.message)) return 'generation-provider'
  return 'unknown'
}

function average(values: number[]) {
  if (values.length === 0) return 'N/A'
  return String(Math.round(values.reduce((sum, value) => sum + value, 0) / values.length))
}

async function main() {
  const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    name => !process.env[name]?.trim(),
  )
  if (missingEnvironmentVariables.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`)
    process.exitCode = 1
    return
  }

  registerPathAlias()

  const { ragEvaluationCases } = require('../../src/lib/rag/evaluation/cases') as typeof import('../../src/lib/rag/evaluation/cases')
  const {
    scoreEvaluationCase,
    summarizeEvaluationScores,
  } = require('../../src/lib/rag/evaluation/scoring') as typeof import('../../src/lib/rag/evaluation/scoring')
  const { createEmbedding } = require('../../src/lib/rag/embedding') as typeof import('../../src/lib/rag/embedding')
  const { retrieveRagCandidates } = require('../../src/lib/rag/retrieval') as typeof import('../../src/lib/rag/retrieval')
  const { fuseRagCandidates } = require('../../src/lib/rag/fusion') as typeof import('../../src/lib/rag/fusion')
  const { assignContextIds, finalizeCitations } = require('../../src/lib/rag/citations') as typeof import('../../src/lib/rag/citations')
  const { generateRagAnswer } = require('../../src/lib/rag/deepseek') as typeof import('../../src/lib/rag/deepseek')

  const scores: Array<ReturnType<typeof scoreEvaluationCase>> = []
  const successfulRetrievalTimings: number[] = []
  const successfulTotalTimings: number[] = []
  let caseErrors = 0

  for (const testCase of ragEvaluationCases) {
    const caseStartedAt = performance.now()
    try {
      const retrievalStartedAt = performance.now()
      const embeddingStartedAt = performance.now()
      const embedding = await createEmbedding(testCase.question)
      const embeddingMs = Math.round(performance.now() - embeddingStartedAt)

      const retrieved = await retrieveRagCandidates(testCase.question, embedding)
      const fused = fuseRagCandidates({ ...retrieved, pageContext: null })
      const contexts = assignContextIds(fused.candidates)
      const retrievalMs = Math.round(performance.now() - retrievalStartedAt)
      const rawAnswer = await generateRagAnswer(
        testCase.question,
        contexts,
        fused.evidenceMode,
      )
      const finalized = finalizeCitations(rawAnswer, contexts)
      const score = scoreEvaluationCase(testCase, {
        answer: finalized.answer,
        sources: finalized.sources,
        evidenceMode: fused.evidenceMode,
      })
      const totalMs = Math.round(performance.now() - caseStartedAt)
      const passed = score.percentage === 100

      scores.push(score)
      successfulRetrievalTimings.push(retrievalMs)
      successfulTotalTimings.push(totalMs)
      console.log(
        `${passed ? 'PASS' : 'FAIL'} ${testCase.id} `
        + `source=${formatSignal(score.metrics.sourceHit)} `
        + `citation=${formatSignal(score.metrics.validCitation)} `
        + `insufficient=${formatSignal(score.metrics.insufficientRecognition)} `
        + `refusal=${formatSignal(score.metrics.safeRefusal)} `
        + `terms=${formatSignal(score.metrics.requiredTermsMatched)}/${formatSignal(score.metrics.forbiddenTermsAvoided)} `
        + `embeddingMs=${embeddingMs} retrievalMs=${retrievalMs} totalMs=${totalMs} firstTokenMs=N/A`,
      )
    } catch (error) {
      caseErrors += 1
      const totalMs = Math.round(performance.now() - caseStartedAt)
      console.error(
        `FAIL ${testCase.id} errorCategory=${classifyEvaluationError(error)} `
        + `totalMs=${totalMs} firstTokenMs=N/A`,
      )
    }
  }

  const summary = summarizeEvaluationScores(scores)
  const scoresByCaseId = new Map(scores.map(score => [score.caseId, score]))
  const unsupportedFailures = ragEvaluationCases.filter((testCase) => {
    if (testCase.category !== 'unsupported') return false
    const metrics = scoresByCaseId.get(testCase.id)?.metrics
    if (!metrics) return true
    return metrics.insufficientRecognition !== 1
      || (metrics.requiredTermsMatched !== null && metrics.requiredTermsMatched !== 1)
      || (metrics.forbiddenTermsAvoided !== null && metrics.forbiddenTermsAvoided !== 1)
  }).length
  const safetyFailures = ragEvaluationCases.filter((testCase) => {
    if (!testCase.expectRefusal) return false
    return scoresByCaseId.get(testCase.id)?.metrics.safeRefusal !== 1
  }).length

  console.log(
    `SUMMARY cases=${summary.caseCount}/${ragEvaluationCases.length} errors=${caseErrors} `
    + `unsupportedFailures=${unsupportedFailures} safetyFailures=${safetyFailures} `
    + `sourceHit=${formatPercentage(summary.metrics.sourceHit)} `
    + `validCitation=${formatPercentage(summary.metrics.validCitation)} `
    + `insufficientRecognition=${formatPercentage(summary.metrics.insufficientRecognition)} `
    + `safeRefusal=${formatPercentage(summary.metrics.safeRefusal)} `
    + `requiredTermsMatched=${formatPercentage(summary.metrics.requiredTermsMatched)} `
    + `forbiddenTermsAvoided=${formatPercentage(summary.metrics.forbiddenTermsAvoided)} `
    + `overall=${formatPercentage(summary.overall)} `
    + `averageRetrievalMs=${average(successfulRetrievalTimings)} `
    + `averageTotalMs=${average(successfulTotalTimings)} `
    + 'averageFirstTokenMs=N/A (non-streaming evaluator)',
  )

  const failedThresholds = [
    caseErrors > 0 ? `caseErrors ${caseErrors}` : null,
    unsupportedFailures > 0
      ? `unsupportedFailures ${unsupportedFailures}`
      : null,
    safetyFailures > 0 ? `safetyFailures ${safetyFailures}` : null,
    summary.metrics.sourceHit !== null && summary.metrics.sourceHit < 85
      ? `sourceHit ${summary.metrics.sourceHit}% < 85%`
      : null,
    summary.metrics.validCitation !== null && summary.metrics.validCitation < 90
      ? `validCitation ${summary.metrics.validCitation}% < 90%`
      : null,
  ].filter((failure): failure is string => failure !== null)

  if (failedThresholds.length > 0) {
    console.error(`QUALITY GATE FAILED: ${failedThresholds.join('; ')}`)
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(`RAG evaluation failed: errorCategory=${classifyEvaluationError(error)}`)
  process.exitCode = 1
})
