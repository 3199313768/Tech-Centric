import crypto from 'crypto'
import type { RagChunkInput, RagDocumentInput } from './types'

const MIN_CHUNK_LENGTH = 300
const MAX_CHUNK_LENGTH = 800

export function normalizeWhitespace(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

export function createContentHash(value: string) {
  return crypto.createHash('sha256').update(normalizeWhitespace(value)).digest('hex')
}

export function estimateTokens(value: string) {
  return Math.ceil(value.length / 2)
}

export function chunkDocument(document: RagDocumentInput): RagChunkInput[] {
  const normalized = normalizeWhitespace(document.content)
  if (!normalized) return []

  const paragraphs = normalized.split(/\n{2,}/).map(part => part.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph
      continue
    }

    const next = `${current}\n\n${paragraph}`
    if (next.length <= MAX_CHUNK_LENGTH) {
      current = next
      continue
    }

    chunks.push(current)
    current = paragraph
  }

  if (current) chunks.push(current)

  const compacted = chunks.flatMap(chunk => splitLongChunk(chunk))
  const merged: string[] = []

  for (const chunk of compacted) {
    const previous = merged[merged.length - 1]
    if (previous && previous.length < MIN_CHUNK_LENGTH && `${previous}\n\n${chunk}`.length <= MAX_CHUNK_LENGTH) {
      merged[merged.length - 1] = `${previous}\n\n${chunk}`
    } else {
      merged.push(chunk)
    }
  }

  return merged.map((content, chunkIndex) => ({
    document,
    chunkIndex,
    content,
    tokenEstimate: estimateTokens(content),
    metadata: {
      sourceType: document.sourceType,
      sourceId: document.sourceId,
      title: document.title,
      tags: document.tags,
    },
  }))
}

function splitLongChunk(value: string) {
  if (value.length <= MAX_CHUNK_LENGTH) return [value]

  const chunks: string[] = []
  for (let index = 0; index < value.length; index += MAX_CHUNK_LENGTH) {
    chunks.push(value.slice(index, index + MAX_CHUNK_LENGTH).trim())
  }
  return chunks.filter(Boolean)
}
