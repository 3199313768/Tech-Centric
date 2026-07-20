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
  const citationByContextId = new Map<string, number>()
  const sources: RagSource[] = []

  const answer = rawAnswer
    .replace(CITATION_PATTERN, (_marker, number: string) => {
      const contextId = `S${number}` as RagContextSource['contextId']
      const context = contextsById.get(contextId)
      if (!context) return ''

      let citation = citationByContextId.get(contextId)
      if (citation === undefined) {
        citation = sources.length + 1
        citationByContextId.set(contextId, citation)
        sources.push({
          citation,
          sourceId: context.sourceId,
          title: context.title,
          url: context.url,
          sourceType: context.sourceType,
          excerpt: context.excerpt,
        })
      }

      return `[${citation}]`
    })
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([,.;:!?])/g, '$1')

  return { answer, sources }
}
