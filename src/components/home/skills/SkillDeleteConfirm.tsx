'use client'

import { DeleteConfirmBar } from '@/components/spirit/feedback/DeleteConfirmBar'

interface SkillDeleteConfirmProps {
  skillName: string
  isLoading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function SkillDeleteConfirm({ skillName, isLoading, onCancel, onConfirm }: SkillDeleteConfirmProps) {
  return (
    <DeleteConfirmBar
      message={`确定删除「${skillName}」？不可撤销`}
      onCancel={onCancel}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  )
}
