'use client'

import Link from 'next/link'
import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { deleteAiSkill } from '@/lib/skills/actions'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { SpiritListCard } from '@/components/spirit/shell/SpiritListCard'
import { DeleteConfirmBar } from '@/components/spirit/feedback/DeleteConfirmBar'
import { getPlatformAccent } from '@/utils/platformAccent'
import { useToast } from '@/components/spirit/feedback/ToastProvider'
import type { AgentSkill } from '@/lib/skills/queries'
import type { SkillProjectLink } from '@/lib/skills/relatedProjects'
import { ScrollReveal } from '@/components/spirit/feedback/ScrollReveal'
import { SpiritEmptyState } from '@/components/spirit/feedback/SpiritEmptyState'
import { useSyncInitialData } from '@/utils/useSyncInitialData'

const AddSkillModal = dynamic(
  () => import('./AddSkillModal').then((m) => ({ default: m.AddSkillModal })),
)

const SKILL_REPO = 'https://github.com/3199313768/SKILL'

interface SkillCardProps {
  skill: AgentSkill
  index: number
  relatedProjects: SkillProjectLink[]
  hoveredId: string | null
  deletingId: string | null
  confirmDeleteId: string | null
  onHover: (id: string | null) => void
  onOpen: (skill: AgentSkill) => void
  onEdit: (skill: AgentSkill) => void
  onRequestDelete: (event: React.MouseEvent, id: string) => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
}

function SkillCard({
  skill,
  index,
  relatedProjects,
  hoveredId,
  deletingId,
  confirmDeleteId,
  onHover,
  onOpen,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: SkillCardProps) {
  return (
    <ScrollReveal index={index}>
      <SpiritListCard
        variant="scroll"
        index={0}
        actionsVisible={hoveredId === skill.id || deletingId === skill.id || confirmDeleteId === skill.id}
        onClick={() => onOpen(skill)}
        actions={
          <>
            <button
              type="button"
              className="sg-icon-btn"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(skill)
              }}
              title="修改此技能"
              aria-label={`修改技能 ${skill.name}`}
            >
              ✎
            </button>
            <button
              type="button"
              className="sg-icon-btn sg-icon-btn--danger"
              onClick={(event) => onRequestDelete(event, skill.id)}
              disabled={deletingId === skill.id}
              title="删除此技能"
              aria-label={`删除技能 ${skill.name}`}
            >
              {deletingId === skill.id ? '...' : '×'}
            </button>
          </>
        }
      >
        <div
          onMouseEnter={() => onHover(skill.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div className="sg-card__head-row sg-workshop-card__head">
            <div className="sg-card__icon-wrap">{skill.icon}</div>
            <div className="sg-workshop-card__meta">
              <h3 className="sg-card__title sg-workshop-card__title">{skill.name}</h3>
              {skill.platform ? (
                <span className="sg-workshop-card__platform">{skill.platform}</span>
              ) : (
                <span className="sg-workshop-card__platform sg-workshop-card__platform--muted">通用技能</span>
              )}
            </div>
          </div>
          <p className="sg-card__desc sg-workshop-card__desc">{skill.description}</p>
          {skill.tags.length > 0 ? (
            <div className="sg-card__tags">
              {skill.tags.map((tag) => (
                <span key={tag} className="sg-tag">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="sg-card__link-hint sg-workshop-card__link">打开技能仓库 ↗</p>
          {relatedProjects.length > 0 ? (
            <div className="sg-workshop-related">
              <p className="sg-workshop-related__label">关联归档</p>
              <div className="sg-workshop-related__links">
                {relatedProjects.map((project) => (
                  <Link
                    key={project.projectId}
                    href={project.href}
                    className="sg-workshop-related__link"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {project.projectName}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {confirmDeleteId === skill.id ? (
            <DeleteConfirmBar
              message={`确定删除「${skill.name}」？不可撤销`}
              onCancel={onCancelDelete}
              onConfirm={() => onConfirmDelete(skill.id)}
              isLoading={deletingId === skill.id}
            />
          ) : null}
        </div>
      </SpiritListCard>
    </ScrollReveal>
  )
}

function SkillGrid({
  skills,
  startIndex,
  skillProjectMap,
  cardProps,
}: {
  skills: AgentSkill[]
  startIndex?: number
  skillProjectMap: Record<string, SkillProjectLink[]>
  cardProps: Omit<SkillCardProps, 'skill' | 'index' | 'relatedProjects'>
}) {
  return (
    <div className="sg-workshop-grid">
      {skills.map((skill, index) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          index={(startIndex ?? 0) + index}
          relatedProjects={skillProjectMap[skill.id] ?? []}
          {...cardProps}
        />
      ))}
    </div>
  )
}

export function AiSkills({
  initialSkills,
  skillProjectMap = {},
}: {
  initialSkills: AgentSkill[]
  skillProjectMap?: Record<string, SkillProjectLink[]>
}) {
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
    skills.forEach((skill) => {
      if (skill.platform) set.add(skill.platform)
    })
    return ['全部', ...Array.from(set)]
  }, [skills])

  const allTags = useMemo(() => Array.from(new Set(skills.flatMap((skill) => skill.tags))), [skills])

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const platformMatch = activePlatform === '全部' || skill.platform === activePlatform
      const tagMatch = !activeTag || skill.tags.includes(activeTag)
      return platformMatch && tagMatch
    })
  }, [skills, activePlatform, activeTag])

  const useGroupedView = activePlatform === '全部' && !activeTag

  const groupedByPlatform = useMemo(() => {
    if (!useGroupedView) return []
    const groups = new Map<string, AgentSkill[]>()
    for (const skill of filteredSkills) {
      const key = skill.platform || '通用技能'
      const bucket = groups.get(key)
      if (bucket) {
        bucket.push(skill)
      } else {
        groups.set(key, [skill])
      }
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      const aIndex = platforms.indexOf(a)
      const bIndex = platforms.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b, 'zh-CN')
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [filteredSkills, platforms, useGroupedView])

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

  const requestDelete = (event: React.MouseEvent, id: string) => {
    event.stopPropagation()
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

  const cardProps: Omit<SkillCardProps, 'skill' | 'index' | 'relatedProjects'> = {
    hoveredId,
    deletingId,
    confirmDeleteId,
    onHover: setHoveredId,
    onOpen: openSkill,
    onEdit: (skill) => {
      setEditingSkill(skill)
      setIsAddModalOpen(true)
    },
    onRequestDelete: requestDelete,
    onConfirmDelete: executeDelete,
    onCancelDelete: () => setConfirmDeleteId(null),
  }

  const isFiltered = activePlatform !== '全部' || activeTag !== null

  return (
    <div className="sg-page">
      <SpiritSubpageHero
        theme="workshop"
        eyebrow="卷轴工房"
        title="技能工坊"
        lead="收录可复用的 Agent Skills：按平台与标签分类，点击卷轴即可跳转仓库查看说明与安装方式。"
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
          <section className="sg-workshop-panel" aria-label="技能筛选">
            <div className="sg-workshop-panel__row">
              <span className="sg-workshop-panel__label" id="workshop-platform-label">
                平台
              </span>
              <div className="sg-filter-bar" role="group" aria-labelledby="workshop-platform-label">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setActivePlatform(platform)}
                    className={`sg-filter-chip sg-filter-chip--sign${activePlatform === platform ? ' sg-filter-chip--active' : ''}`}
                  >
                    {platform !== '全部' ? (
                      <span
                        className="sg-filter-chip__dot"
                        style={{ background: getPlatformAccent(platform) }}
                        aria-hidden
                      />
                    ) : null}
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {allTags.length > 0 ? (
              <div className="sg-workshop-panel__row">
                <span className="sg-workshop-panel__label" id="workshop-tag-label">
                  标签
                </span>
                <div className="sg-filter-bar" role="group" aria-labelledby="workshop-tag-label">
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
              </div>
            ) : null}

            <p className="sg-workshop-panel__summary">
              共 {filteredSkills.length} 条技能
              {isFiltered ? ' · 已应用筛选' : ' · 按平台分区浏览'}
            </p>
          </section>

          <section className="sg-workshop-catalog" aria-label="技能目录">
            {filteredSkills.length === 0 ? (
              <SpiritEmptyState
                className="sg-empty-state--grid"
                imageSrc="/spirit-garden/icon-sparkle.png"
                title="暂无符合筛选条件的技能"
                description="调整平台或标签筛选后重试。"
              />
            ) : useGroupedView ? (
              groupedByPlatform.map(([platform, items], sectionIndex) => (
                <div key={platform} className="sg-workshop-section">
                  <header className="sg-workshop-section__head">
                    <span
                      className="sg-workshop-section__dot"
                      style={{ background: getPlatformAccent(platform === '通用技能' ? undefined : platform) }}
                      aria-hidden
                    />
                    <div className="sg-workshop-section__copy">
                      <h2 className="sg-workshop-section__title">{platform}</h2>
                      <p className="sg-workshop-section__hint">
                        {platform === 'Shell' && '终端脚本与自动化命令'}
                        {platform === 'Git Hook' && '提交钩子与规范校验'}
                        {platform === 'Python' && 'Python 脚本与 AI 辅助流程'}
                        {platform === '通用技能' && '跨平台通用能力'}
                        {!['Shell', 'Git Hook', 'Python', '通用技能'].includes(platform) && '该平台下的 Agent Skills'}
                      </p>
                    </div>
                    <span className="sg-workshop-section__count">{items.length} 项</span>
                  </header>
                  <SkillGrid
                    skills={items}
                    startIndex={sectionIndex * 3}
                    skillProjectMap={skillProjectMap}
                    cardProps={cardProps}
                  />
                </div>
              ))
            ) : (
              <div className="sg-workshop-section">
                <header className="sg-workshop-section__head">
                  <span
                    className="sg-workshop-section__dot"
                    style={{
                      background: getPlatformAccent(activePlatform === '全部' ? undefined : activePlatform),
                    }}
                    aria-hidden
                  />
                  <div className="sg-workshop-section__copy">
                    <h2 className="sg-workshop-section__title">筛选结果</h2>
                    <p className="sg-workshop-section__hint">
                      {activePlatform !== '全部' ? `平台：${activePlatform}` : '全部平台'}
                      {activeTag ? ` · 标签：#${activeTag}` : ''}
                    </p>
                  </div>
                  <span className="sg-workshop-section__count">{filteredSkills.length} 项</span>
                </header>
                <SkillGrid skills={filteredSkills} skillProjectMap={skillProjectMap} cardProps={cardProps} />
              </div>
            )}
          </section>
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
