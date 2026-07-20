import type {
  FusedRagCandidate,
  RagContextSource,
  RagSource,
} from '@/lib/rag/types'

const CITATION_PATTERN = /\[S(\d+)\]/g

interface FinalizedCitations {
  answer: string
  sources: RagSource[]
}

export function assignContextIds(
  candidates: FusedRagCandidate[],
): RagContextSource[] {
  return candidates.map((candidate, index) => ({
    ...candidate,
    contextId: `S${index + 1}`,
  }))
}

export function finalizeCitations(
  rawAnswer: string,
  contexts: RagContextSource[],
): FinalizedCitations {
  const contextsById = new Map(
    contexts.map((context) => [context.contextId, context]),
  )
  const citationBySourceId = new Map<string, number>()
  const sources: RagSource[] = []
  let answer = ''
  let cursor = 0

  for (const match of rawAnswer.matchAll(CITATION_PATTERN)) {
    const markerIndex = match.index
    const marker = match[0]
    const contextId = `S${match[1]}` as RagContextSource['contextId']
    const context = contextsById.get(contextId)
    const markerEnd = markerIndex + marker.length
    let precedingText = rawAnswer.slice(cursor, markerIndex)

    if (!context) {
      const nextCharacter = rawAnswer[markerEnd]
      if (
        /[ \t]$/.test(precedingText) &&
        (/[ \t]/.test(nextCharacter ?? '') || /[,.;:!?]/.test(nextCharacter ?? ''))
      ) {
        precedingText = precedingText.slice(0, -1)
      }
      answer += precedingText
      cursor = markerEnd
      continue
    }

    let citation = citationBySourceId.get(context.sourceId)
    if (citation === undefined) {
      citation = sources.length + 1
      citationBySourceId.set(context.sourceId, citation)
      sources.push({
        citation,
        sourceId: context.sourceId,
        title: context.title,
        url: context.url,
        sourceType: context.sourceType,
        excerpt: context.excerpt,
      })
    }

    answer += `${precedingText}[${citation}]`
    cursor = markerEnd
  }

  answer += rawAnswer.slice(cursor)

  return { answer, sources }
}
