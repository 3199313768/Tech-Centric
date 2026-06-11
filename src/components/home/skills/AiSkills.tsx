'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { deleteAiSkill } from '@/lib/skills/actions'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { SpiritListCard } from '@/components/spirit/shell/SpiritListCard'
import { DeleteConfirmBar } from '@/components/spirit/feedback/DeleteConfirmBar'
import { getPlatformClass } from '@/utils/platformAccent'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import type { AgentSkill } from '@/lib/skills/queries'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'
import { useSyncInitialData } from '@/utils/useSyncInitialData'

const AddSkillModal = dynamic(
  () => import('./AddSkillModal').then((m) => ({ default: m.AddSkillModal })),
)

const SKILL_REPO = 'https://github.com/3199313768/SKILL'

function skillInkLevel(skill: AgentSkill): number {
  return Math.min(100, 42 + skill.tags.length * 14)
}

export function AiSkills({ initialSkills }: { initialSkills: AgentSkill[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [skills, setSkills] = useState(initialSkills)
  useSyncInitialData(initialSkills, setSkills)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingSkill, setEditingSkill] = useState<AgentSkill | null>(null)
  const [activePlatform, setActivePlatform] = useState<string>('全部')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const refreshSkills = useCallback(() => {
    router.refresh()
  }, [router])

  const platforms = useMemo(() => {
    const set = new Set<string>()
    skills.forEach((s) => {
      if (s.platform) set.add(s.platform)
    })
    return ['全部', ...Array.from(set)]
  }, [skills])

  const allTags = useMemo(() => Array.from(new Set(skills.flatMap((s) => s.tags))), [skills])

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const platformMatch = activePlatform === '全部' || skill.platform === activePlatform
      const tagMatch = !activeTag || skill.tags.includes(activeTag)
      return platformMatch && tagMatch
    })
  }, [skills, activePlatform, activeTag])

  const scrollRailSkills = filteredSkills.slice(0, 4)

  const executeDelete = async (id: string) => {
    setDeletingId(id)
    setConfirmDeleteId(null)
    const { error } = await deleteAiSkill(id)
    setDeletingId(null)

    if (error) {
      toast(`删除失败：${error}`, 'error')
    } else {
      toast('技能已删除', 'success')
      setSkills((prev) => prev.filter((skill) => skill.id !== id))
      refreshSkills()
    }
  }

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  const openAddModal = () => {
    setEditingSkill(null)
    setIsAddModalOpen(true)
  }

  const openSkill = (skill: AgentSkill) => {
    const url = skill.link || SKILL_REPO
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="workshop"
        eyebrow="卷轴工房"
        title="技能工坊"
        lead="一套提高开发效率的 Agent Skills 集合，包含代码提交、提交规范、周报生成、UI 优化、代码审计等实用技能。"
        stats={[
          { label: '技能卷轴', value: skills.length },
          { label: '平台覆盖', value: Math.max(platforms.length - 1, 0) },
          { label: '标签维度', value: allTags.length },
        ]}
        actions={
          <button type="button" className="sg-btn sg-btn--primary" onClick={openAddModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新增技能
          </button>
        }
      />

      {skills.length === 0 ? (
        <SpiritEmptyState
          imageSrc="/spirit-garden/icon-sparkle.png"
          title="卷轴工房尚空"
          description="通过上方按钮收录第一条 Agent Skill。"
          action={
            <button type="button" className="sg-btn sg-btn--primary" onClick={openAddModal}>
              新增技能
            </button>
          }
        />
      ) : (
        <>
          {scrollRailSkills.length > 0 ? (
            <div className="sg-scroll-rail" aria-label="精选技能卷轴">
              {scrollRailSkills.map((skill) => {
                const platformClass = getPlatformClass(skill.platform)
                return (
                  <button
                    key={`rail-${skill.id}`}
                    type="button"
                    className={`sg-scroll-rail__item sg-scroll-rail__item--${platformClass}`}
                    onClick={() => openSkill(skill)}
                  >
                    <div className="sg-scroll-rail__icon">{skill.icon}</div>
                    <p className="sg-scroll-rail__name">{skill.name}</p>
                    {skill.platform ? (
                      <span className="sg-scroll-rail__platform">{skill.platform}</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : null}

          <div className="sg-workshop-toolbar">
            <div className="sg-filter-bar">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setActivePlatform(platform)}
                  className={`sg-filter-chip${activePlatform === platform ? ' sg-filter-chip--active' : ''}`}
                >
                  {platform}
                </button>
              ))}
            </div>
            {allTags.length > 0 ? (
              <div className="sg-filter-bar">
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className={`sg-filter-chip${activeTag === null ? ' sg-filter-chip--active' : ''}`}
                >
                  全部标签
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`sg-filter-chip${activeTag === tag ? ' sg-filter-chip--active' : ''}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="sg-workshop-grid">
            {filteredSkills.length === 0 ? (
              <SpiritEmptyState
                className="sg-empty-state--grid"
                imageSrc="/spirit-garden/icon-sparkle.png"
                title="暂无符合筛选条件的技能"
                description="调整平台或标签筛选后重试。"
              />
            ) : (
              filteredSkills.map((skill, index) => (
                <SpiritListCard
                  key={skill.id}
                  variant="scroll"
                  platform={skill.platform}
                  index={index}
                  actionsVisible={hoveredId === skill.id || deletingId === skill.id || confirmDeleteId === skill.id}
                  onClick={() => openSkill(skill)}
                  actions={
                    <>
                      <button
                        type="button"
                        className="sg-icon-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingSkill(skill)
                          setIsAddModalOpen(true)
                        }}
                        title="修改此技能"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="sg-icon-btn sg-icon-btn--danger"
                        onClick={(e) => requestDelete(e, skill.id)}
                        disabled={deletingId === skill.id}
                        title="删除此技能"
                      >
                        {deletingId === skill.id ? '...' : '×'}
                      </button>
                    </>
                  }
                >
                  <div
                    onMouseEnter={() => setHoveredId(skill.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="sg-card__head-row">
                      <div className="sg-card__icon-wrap">{skill.icon}</div>
                    </div>
                    <h3 className="sg-card__title">{skill.name}</h3>
                    <p className="sg-card__desc">{skill.description}</p>
                    <div className="sg-skill-ink-meter" aria-hidden>
                      <div className="sg-meter-track">
                        <div
                          className="sg-meter-fill sg-meter-fill--ink"
                          style={{ width: `${skillInkLevel(skill)}%` }}
                        />
                      </div>
                    </div>
                    <div className="sg-card__tags">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="sg-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    {confirmDeleteId === skill.id ? (
                      <DeleteConfirmBar
                        message={`确定删除「${skill.name}」？不可撤销`}
                        onCancel={() => setConfirmDeleteId(null)}
                        onConfirm={() => executeDelete(skill.id)}
                        isLoading={deletingId === skill.id}
                      />
                    ) : null}
                  </div>
                </SpiritListCard>
              ))
            )}
          </div>
        </>
      )}

      <AddSkillModal
        key={editingSkill?.id ?? 'new-skill'}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingSkill(null)
        }}
        onSuccess={refreshSkills}
        initialData={editingSkill}
      />
    </div>
  )
}
