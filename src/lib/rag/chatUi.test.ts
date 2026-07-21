import { describe, expect, it } from 'vitest'
import type { ChatMessage } from '@/lib/rag/types'
import {
  getLoadingStageForEvent,
  getNextLoadingStage,
  isLongRagAnswer,
  shouldShowAnswerActions,
  shouldShowInsufficientActions,
} from './chatUi'

const completeAnswer: ChatMessage = {
  role: 'assistant',
  content: '完整回答',
  sources: [{
    citation: 1,
    sourceId: 'project-1',
    title: '项目一',
    url: '/projects/project-1',
    sourceType: 'static_project',
    excerpt: '项目摘要',
  }],
  evidenceMode: 'site',
  isComplete: true,
}

describe('RAG chat UI policy', () => {
  it('advances the loading stages in order', () => {
    expect(getNextLoadingStage('understanding')).toBe('retrieving')
    expect(getNextLoadingStage('retrieving')).toBe('generating')
    expect(getNextLoadingStage('generating')).toBe('generating')
  })

  it('shows organizing before content and hides loading on the first delta', () => {
    expect(getLoadingStageForEvent('retrieving', 'meta')).toBe('generating')
    expect(getLoadingStageForEvent('generating', 'delta')).toBeNull()
    expect(getLoadingStageForEvent('generating', 'done')).toBeNull()
    expect(getLoadingStageForEvent('retrieving', 'error')).toBeNull()
  })

  it('shows answer actions only for completed error-free default answers', () => {
    expect(shouldShowAnswerActions(completeAnswer)).toBe(true)
    expect(shouldShowAnswerActions({ ...completeAnswer, error: '回答中断' })).toBe(false)
    expect(shouldShowAnswerActions({ ...completeAnswer, isComplete: false })).toBe(false)
    expect(shouldShowAnswerActions({ ...completeAnswer, variant: 'contact' })).toBe(false)
  })

  it('shows exits for insufficient answers or completed answers without sources', () => {
    expect(shouldShowInsufficientActions({
      ...completeAnswer,
      sources: [],
      evidenceMode: 'insufficient',
    })).toBe(true)
    expect(shouldShowInsufficientActions({ ...completeAnswer, sources: [] })).toBe(true)
    expect(shouldShowInsufficientActions(completeAnswer)).toBe(false)
  })

  it('does not show insufficient exits for errors or non-default messages', () => {
    expect(shouldShowInsufficientActions({
      ...completeAnswer,
      sources: [],
      error: '请求失败',
    })).toBe(false)
    expect(shouldShowInsufficientActions({
      ...completeAnswer,
      sources: [],
      variant: 'system',
    })).toBe(false)
  })

  it('treats only answers longer than 600 characters as long', () => {
    expect(isLongRagAnswer('a'.repeat(600))).toBe(false)
    expect(isLongRagAnswer('a'.repeat(601))).toBe(true)
  })
})
