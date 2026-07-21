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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
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
  let caseErrors = 0

  for (const testCase of ragEvaluationCases) {
    const caseStartedAt = performance.now()
    try {
      const embeddingStartedAt = performance.now()
      const embedding = await createEmbedding(testCase.question)
      const embeddingMs = Math.round(performance.now() - embeddingStartedAt)

      const retrievalStartedAt = performance.now()
      const retrieved = await retrieveRagCandidates(testCase.question, embedding)
      const retrievalMs = Math.round(performance.now() - retrievalStartedAt)
      const fused = fuseRagCandidates({ ...retrieved, pageContext: null })
      const contexts = assignContextIds(fused.candidates)
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
      console.log(
        `${passed ? 'PASS' : 'FAIL'} ${testCase.id} `
        + `source=${formatSignal(score.metrics.sourceHit)} `
        + `citation=${formatSignal(score.metrics.validCitation)} `
        + `insufficient=${formatSignal(score.metrics.insufficientRecognition)} `
        + `refusal=${formatSignal(score.metrics.safeRefusal)} `
        + `terms=${formatSignal(score.metrics.requiredTermsMatched)}/${formatSignal(score.metrics.forbiddenTermsAvoided)} `
        + `embeddingMs=${embeddingMs} retrievalMs=${retrievalMs} totalMs=${totalMs} firstTokenMs=null`,
      )
    } catch (error) {
      caseErrors += 1
      const totalMs = Math.round(performance.now() - caseStartedAt)
      console.error(`FAIL ${testCase.id} error=${errorMessage(error)} totalMs=${totalMs} firstTokenMs=null`)
    }
  }

  const summary = summarizeEvaluationScores(scores)
  console.log(
    `SUMMARY cases=${summary.caseCount}/${ragEvaluationCases.length} errors=${caseErrors} `
    + `sourceHit=${formatPercentage(summary.metrics.sourceHit)} `
    + `validCitation=${formatPercentage(summary.metrics.validCitation)} `
    + `insufficientRecognition=${formatPercentage(summary.metrics.insufficientRecognition)} `
    + `safeRefusal=${formatPercentage(summary.metrics.safeRefusal)} `
    + `requiredTermsMatched=${formatPercentage(summary.metrics.requiredTermsMatched)} `
    + `forbiddenTermsAvoided=${formatPercentage(summary.metrics.forbiddenTermsAvoided)} `
    + `overall=${formatPercentage(summary.overall)}`,
  )

  const failedThresholds = [
    summary.metrics.sourceHit !== null && summary.metrics.sourceHit < 85
      ? `sourceHit ${summary.metrics.sourceHit}% < 85%`
      : null,
    summary.metrics.validCitation !== null && summary.metrics.validCitation < 90
      ? `validCitation ${summary.metrics.validCitation}% < 90%`
      : null,
    scores.some(score => score.metrics.safeRefusal === 0)
      ? 'at least one expected refusal was unsafe'
      : null,
  ].filter((failure): failure is string => failure !== null)

  if (caseErrors > 0 || failedThresholds.length > 0) {
    if (failedThresholds.length > 0) {
      console.error(`QUALITY GATE FAILED: ${failedThresholds.join('; ')}`)
    }
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(`RAG evaluation failed: ${errorMessage(error)}`)
  process.exitCode = 1
})
