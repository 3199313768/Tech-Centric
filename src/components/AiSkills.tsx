'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddSkillModal } from './AddSkillModal'
import { SpiritSubpageHero } from '@/components/spirit/SpiritSubpageHero'
import { SpiritListCard } from '@/components/spirit/SpiritListCard'
import { getPlatformClass } from '@/utils/platformAccent'

interface AgentSkill {
  id: string
  name: string
  icon: string
  description: string
  tags: string[]
  platform?: string
  link?: string
}

const SKILL_REPO = 'https://github.com/3199313768/SKILL'

export function AiSkills() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [skills, setSkills] = useState<AgentSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingSkill, setEditingSkill] = useState<AgentSkill | null>(null)
  const [activePlatform, setActivePlatform] = useState<string>('全部')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const fetchSkills = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('ai_skills').select('*').order('created_at', { ascending: false })
    if (!error && data) {
      setSkills(data.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        description: item.description,
        tags: Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.replace(/^{|}$/g, '').split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')) : []),
        platform: item.platform,
        link: item.link
      })))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSkills()
  }, [fetchSkills])

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

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!window.confirm(`确定要删除技能 "${name}" 吗？此操作不可逆。`)) {
      return
    }
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('ai_skills').delete().eq('id', id)
    setDeletingId(null)

    if (error) {
      alert('删除失败：' + error.message)
    } else {
      fetchSkills()
    }
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
          { label: '技能卷轴', value: isLoading ? '—' : skills.length },
          { label: '平台覆盖', value: isLoading ? '—' : Math.max(platforms.length - 1, 0) },
          { label: '标签维度', value: isLoading ? '—' : allTags.length },
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

      {isLoading ? (
        <div className="sg-state sg-state--loading">
          <div className="sg-state__spinner" aria-hidden />
          加载中...
        </div>
      ) : skills.length === 0 ? (
        <div className="sg-state sg-state--empty">
          暂无技能数据，通过上方按钮添加一个吧！
        </div>
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
              <div className="sg-state sg-state--empty" style={{ gridColumn: '1 / -1' }}>
                暂无符合筛选条件的技能
              </div>
            ) : (
              filteredSkills.map((skill, index) => (
                <SpiritListCard
                  key={skill.id}
                  variant="scroll"
                  platform={skill.platform}
                  index={index}
                  actionsVisible={hoveredId === skill.id || deletingId === skill.id}
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
                        onClick={(e) => handleDelete(e, skill.id, skill.name)}
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
                    <div className="sg-card__tags">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="sg-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </SpiritListCard>
              ))
            )}
          </div>
        </>
      )}

      <AddSkillModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingSkill(null)
        }}
        onSuccess={fetchSkills}
        initialData={editingSkill}
      />
    </div>
  )
}
