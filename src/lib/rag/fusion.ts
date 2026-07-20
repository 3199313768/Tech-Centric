import type {
  FusedRagCandidate,
  RagEvidenceMode,
  RagPageContext,
  RagRetrievalCandidate,
  RagSourceType,
} from '@/lib/rag/types'

const RRF_OFFSET = 60
const PAGE_CONTEXT_BOOST = 0.002
const MAX_RESULTS = 8
const MAX_CHUNKS_PER_DOCUMENT = 2
const STRONG_VECTOR_SIMILARITY = 0.7
const CLOSE_SIMILARITY_GAP = 0.05

interface FuseRagCandidatesInput {
  vector: RagRetrievalCandidate[]
  lexical: RagRetrievalCandidate[]
  pageContext: RagPageContext | null
}

interface FuseRagCandidatesResult {
  candidates: FusedRagCandidate[]
  evidenceMode: RagEvidenceMode
}

interface MutableFusedCandidate extends RagRetrievalCandidate {
  fusedScore: number
  matchedChannels: Array<'vector' | 'lexical'>
}

const contextSourceTypes: Partial<Record<RagPageContext, RagSourceType>> = {
  projects: 'static_project',
  knowledge: 'knowledge_record',
  resources: 'static_resource',
  vibe: 'vibe_entry',
  about: 'static_personal',
  skills: 'static_personal',
  showcase: 'static_project',
  stats: 'static_personal',
}

function matchesPageContext(
  candidate: RagRetrievalCandidate,
  pageContext: RagPageContext,
): boolean {
  return candidate.sourceType === contextSourceTypes[pageContext]
}

function hasComparableStrength(
  candidate: RagRetrievalCandidate,
  strongestSimilarity: number | null,
): boolean {
  if (strongestSimilarity === null || candidate.similarity === null) return false

  return candidate.similarity >= strongestSimilarity - CLOSE_SIMILARITY_GAP
}

function determineEvidenceMode(
  candidates: FusedRagCandidate[],
): RagEvidenceMode {
  if (candidates.length === 0) return 'insufficient'

  const hasSiteEvidence = candidates.slice(0, 2).some(
    (candidate) =>
      candidate.matchedChannels.length === 2 ||
      (candidate.similarity !== null &&
        candidate.similarity >= STRONG_VECTOR_SIMILARITY) ||
      candidate.exactMatch,
  )

  return hasSiteEvidence ? 'site' : 'insufficient'
}

export function fuseRagCandidates({
  vector,
  lexical,
  pageContext,
}: FuseRagCandidatesInput): FuseRagCandidatesResult {
  const candidatesByChunk = new Map<string, MutableFusedCandidate>()

  function addChannel(
    candidates: RagRetrievalCandidate[],
    channel: 'vector' | 'lexical',
  ) {
    candidates.forEach((candidate, index) => {
      const rank = index + 1
      const existing = candidatesByChunk.get(candidate.chunkId)

      if (existing) {
        if (existing.matchedChannels.includes(channel)) return

        existing.fusedScore += 1 / (RRF_OFFSET + rank)
        existing.matchedChannels.push(channel)
        if (channel === 'lexical') {
          existing.lexicalScore = candidate.lexicalScore
          existing.exactMatch ||= candidate.exactMatch
        }
        return
      }

      candidatesByChunk.set(candidate.chunkId, {
        ...candidate,
        fusedScore: 1 / (RRF_OFFSET + rank),
        matchedChannels: [channel],
      })
    })
  }

  addChannel(vector, 'vector')
  addChannel(lexical, 'lexical')

  const candidates = Array.from(candidatesByChunk.values())
  const strongestFusedScore = candidates.reduce(
    (strongest, candidate) => Math.max(strongest, candidate.fusedScore),
    0,
  )
  const strongestSimilarity = candidates.reduce<number | null>(
    (strongest, candidate) =>
      candidate.similarity !== null &&
      (strongest === null || candidate.similarity > strongest)
        ? candidate.similarity
        : strongest,
    null,
  )

  if (pageContext) {
    for (const candidate of candidates) {
      if (
        matchesPageContext(candidate, pageContext) &&
        strongestFusedScore - candidate.fusedScore <= PAGE_CONTEXT_BOOST &&
        hasComparableStrength(candidate, strongestSimilarity)
      ) {
        candidate.fusedScore += PAGE_CONTEXT_BOOST
      }
    }
  }

  candidates.sort(
    (left, right) =>
      right.fusedScore - left.fusedScore ||
      left.chunkId.localeCompare(right.chunkId),
  )

  const documentCounts = new Map<string, number>()
  const selected: FusedRagCandidate[] = []

  for (const candidate of candidates) {
    const documentCount = documentCounts.get(candidate.documentId) ?? 0
    if (documentCount >= MAX_CHUNKS_PER_DOCUMENT) continue

    selected.push(candidate)
    documentCounts.set(candidate.documentId, documentCount + 1)
    if (selected.length === MAX_RESULTS) break
  }

  return {
    candidates: selected,
    evidenceMode: determineEvidenceMode(selected),
  }
}
