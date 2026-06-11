'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { type ResourceItem } from '@/data/resources/initialResources'
import { useBreakpoint } from '@/utils/useBreakpoint'
import { SpiritSubpageHero } from '@/components/spirit/shell/SpiritSubpageHero'
import { ResourceToolbar } from '@/components/spirit/resource/ResourceToolbar'
import { ResourcePinnedRail } from '@/components/spirit/resource/ResourcePinnedRail'
import { ResourceShelfGrid } from '@/components/spirit/resource/ResourceShelfGrid'
import type { ResourceCardHandlers } from '@/components/spirit/resource/ResourceCard'
import { RESOURCE_API_ROUTES } from '@/lib/site/routes'
import { deriveResourceCategories } from '@/lib/resources/mappers'
import { filterAndSortResources } from '@/lib/resources/filter'
import {
  generateResourceId,
  loadResourceCandidates,
  saveResourceCandidates,
} from '@/lib/resources/candidates'
import {
  deleteResourceItem,
  deleteResourceItems,
  insertResourceItem,
  saveResourceItem,
  updateResourceItem,
  upsertResourceItems,
} from '@/lib/resources/actions'
import { useSyncInitialData } from '@/utils/useSyncInitialData'
import type { ResourceFormData } from '@/components/home/resources/ResourceFormModal'

const ResourceConfirmModal = dynamic(
  () => import('@/components/home/resources/ResourceConfirmModal').then((m) => ({ default: m.ResourceConfirmModal })),
)
const ResourceDiscoveryModal = dynamic(
  () => import('@/components/home/resources/ResourceDiscoveryModal').then((m) => ({ default: m.ResourceDiscoveryModal })),
)
const ResourceFormModal = dynamic(
  () => import('@/components/home/resources/ResourceFormModal').then((m) => ({ default: m.ResourceFormModal })),
)

export type { ResourceItem }

const emptyForm: ResourceFormData = {
  name: '',
  url: '',
  description: '',
  category: 'other',
  tags: [],
}

interface ResourceLinksProps {
  initialItems: ResourceItem[]
  initialCategories: string[]
}

export function ResourceLinks({ initialItems, initialCategories }: ResourceLinksProps) {
  const { isMobile, isTablet } = useBreakpoint()
  const modalPad = isMobile ? '20px' : isTablet ? '28px' : '40px'
  const overlayPad = isMobile ? '12px' : '20px'
  const [nowTs] = useState(() => Date.now())
  const [items, setItems] = useState(initialItems)
  const [categories, setCategories] = useState(initialCategories)
  useSyncInitialData(initialItems, setItems)
  useSyncInitialData(initialCategories, setCategories)
  const [filter, setFilter] = useState<string | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ResourceFormData>(emptyForm)
  const [isFetchingMeta, setIsFetchingMeta] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [isExploring, setIsExploring] = useState(false)
  const [discoveredItems, setDiscoveredItems] = useState<ResourceItem[]>([])
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false)
  const [candidateItems, setCandidateItems] = useState<ResourceItem[]>(() => loadResourceCandidates())
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const syncCategories = useCallback((nextItems: ResourceItem[]) => {
    setCategories(deriveResourceCategories(nextItems))
  }, [])

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 3000)
  }, [])

  const handleCopy = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopyingId(id)
    setTimeout(() => setCopyingId(null), 2000)
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
    setFilter('all')
  }

  const handleExplore = async () => {
    setIsExploring(true)
    setDiscoveredItems([])
    try {
      const res = await fetch(RESOURCE_API_ROUTES.explore, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentResources: items.slice(0, 10).map((i) => ({
            name: i.name,
            description: i.description,
          })),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (!Array.isArray(data)) throw new Error('返回数据格式异常')

      setDiscoveredItems(data)
      setShowDiscoveryModal(true)
    } catch (err) {
      showToast(
        `AI 探测失败: ${err instanceof Error ? err.message : '未知错误'}。可能原因：API Key 无额度或网络策略限制。`,
      )
    } finally {
      setIsExploring(false)
    }
  }

  const addToLibrary = async (item: ResourceItem) => {
    if (items.find((i) => i.url === item.url)) {
      showToast('资源已存在于库中')
      return
    }
    const newItem = { ...item, createdAt: Date.now(), isPinned: false, clickCount: 0 }
    const nextItems = [...items, newItem]
    setItems(nextItems)
    syncCategories(nextItems)

    const { error } = await insertResourceItem(newItem)
    if (error) {
      showToast(`入库失败：${error}`)
      return
    }

    setDiscoveredItems((prev) => prev.filter((i) => i.id !== item.id))
    const nextCandidates = candidateItems.filter((i) => i.url !== item.url)
    setCandidateItems(nextCandidates)
    saveResourceCandidates(nextCandidates)
  }

  const handleAutoFill = async () => {
    const url = formData.url.trim()
    if (!url) {
      showToast('请先输入 URL')
      return
    }
    setIsFetchingMeta(true)
    try {
      const res = await fetch(RESOURCE_API_ROUTES.autofill, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFormData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        category: data.category || prev.category,
        tags: Array.from(new Set([...prev.tags, ...(data.tags || [])])),
      }))
    } catch {
      showToast('AI 填充失败，请手动填写')
    } finally {
      setIsFetchingMeta(false)
    }
  }

  const fetchMeta = async (url: string) => {
    if (!url || !url.includes('.')) return
    setIsFetchingMeta(true)
    try {
      const response = await fetch(
        `${RESOURCE_API_ROUTES.meta}?url=${encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)}`,
      )
      const data = await response.json()
      if (data.title || data.description) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || data.title || '',
          description: prev.description || data.description || '',
        }))
      }
    } catch {
      showToast('抓取元数据失败')
    } finally {
      setIsFetchingMeta(false)
    }
  }

  const togglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const item = items.find((i) => i.id === id)
    if (!item) return
    setItems(items.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i)))
    await updateResourceItem(id, { isPinned: !item.isPinned })
  }

  const incrementClick = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const nextCount = (item.clickCount || 0) + 1
    setItems((prevItems) =>
      prevItems.map((i) =>
        i.id === id ? { ...i, clickCount: nextCount } : i,
      ),
    )
    await updateResourceItem(id, { clickCount: nextCount })
  }

  const filteredItems = filterAndSortResources(items, filter, searchQuery)

  const openForm = (item?: ResourceItem) => {
    if (item) {
      setEditingId(item.id)
      setFormData({
        name: item.name,
        url: item.url,
        description: item.description ?? '',
        category: item.category,
        tags: item.tags ?? [],
      })
    } else {
      setEditingId(null)
      setFormData(emptyForm)
    }
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const url = formData.url.trim()
    if (!name || !url) return

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    const tags = formData.tags.filter((t) => t.trim()).map((t) => t.trim())

    if (editingId) {
      const updated: ResourceItem = {
        ...(items.find((i) => i.id === editingId) as ResourceItem),
        name,
        url: normalizedUrl,
        description: formData.description.trim() || undefined,
        category: formData.category,
        tags: tags.length > 0 ? tags : undefined,
      }
      const nextItems = items.map((i) => (i.id === editingId ? updated : i))
      setItems(nextItems)
      syncCategories(nextItems)
      await saveResourceItem(updated)
    } else {
      const newObj: ResourceItem = {
        id: generateResourceId(),
        name,
        url: normalizedUrl,
        description: formData.description.trim() || undefined,
        category: formData.category,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: Date.now(),
        isPinned: false,
        clickCount: 0,
      }
      const nextItems = [...items, newObj]
      setItems(nextItems)
      syncCategories(nextItems)
      await insertResourceItem(newObj)
    }
    closeForm()
  }

  const handleDelete = async (id: string) => {
    const nextItems = items.filter((i) => i.id !== id)
    setItems(nextItems)
    syncCategories(nextItems)
    setDeleteConfirmId(null)
    await deleteResourceItem(id)
  }

  const handleBatchDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: '批量删除确认',
      message: `确定要删除选中的 ${selectedIds.size} 项资源吗？此操作不可撤销。`,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedIds)
        const nextItems = items.filter((i) => !selectedIds.has(i.id))
        setItems(nextItems)
        syncCategories(nextItems)
        setSelectedIds(new Set())
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }))

        await deleteResourceItems(idsToDelete)
      },
    })
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `resources_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const imported = JSON.parse(text) as Partial<ResourceItem>[]
        if (!Array.isArray(imported)) throw new Error('Invalid format')

        let addedCount = 0
        let updatedCount = 0
        let invalidCount = 0

        const tempNext = [...items]

        const processedItems = imported
          .map((item) => {
            if (!item.name || !item.url) {
              invalidCount++
              return null
            }
            return {
              ...(item as ResourceItem),
              id: item.id || generateResourceId(),
            }
          })
          .filter(Boolean) as ResourceItem[]

        processedItems.forEach((item) => {
          const index = tempNext.findIndex((i) => i.id === item.id)
          if (index > -1) {
            tempNext[index] = { ...tempNext[index], ...item }
            updatedCount++
          } else {
            tempNext.push({
              ...item,
              createdAt: item.createdAt || Date.now(),
              clickCount: item.clickCount || 0,
            })
            addedCount++
          }
        })

        setItems(tempNext)
        syncCategories(tempNext)
        await upsertResourceItems(tempNext)

        showToast(
          `导入完成！新增 ${addedCount} 条，更新 ${updatedCount} 条，无效跳过 ${invalidCount} 条`,
        )
      } catch {
        showToast('导入失败：文件格式不正确或已损坏')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const closeDiscoveryModal = () => {
    const nextCandidates = Array.from(
      new Set([...candidateItems, ...discoveredItems].map((i) => i.url)),
    ).map((url) => [...candidateItems, ...discoveredItems].find((i) => i.url === url)!)
    setCandidateItems(nextCandidates)
    saveResourceCandidates(nextCandidates)
    setShowDiscoveryModal(false)

    if (discoveredItems.length > 0) {
      showToast('未入库的灵感已自动收纳入“待选池”')
    }
  }

  const handleDiscoveryRemove = (item: ResourceItem) => {
    setDiscoveredItems((prev) => prev.filter((i) => i.id !== item.id))
    const nextCandidates = candidateItems.filter((i) => i.url !== item.url)
    setCandidateItems(nextCandidates)
    saveResourceCandidates(nextCandidates)
  }

  const pinnedCount = items.filter((i) => i.isPinned).length
  const categoryCount = new Set(items.map((i) => i.category)).size

  const cardHandlers: ResourceCardHandlers = {
    onCopy: handleCopy,
    onTogglePin: togglePin,
    onEdit: (e, item) => {
      e.stopPropagation()
      openForm(item)
    },
    onDeleteRequest: (e, id) => {
      e.stopPropagation()
      setDeleteConfirmId(id)
    },
    onDeleteConfirm: (e, id) => {
      e.stopPropagation()
      void handleDelete(id)
    },
    onDeleteCancel: (e) => {
      e.stopPropagation()
      setDeleteConfirmId(null)
    },
    onTagClick: handleTagClick,
    onVisit: incrementClick,
    onSelectToggle: (id) => {
      const next = new Set(selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setSelectedIds(next)
    },
  }

  const handlePinnedVisit = (item: ResourceItem) => {
    void incrementClick(item.id)
    window.open(item.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="sg-page sg-resource-page">
      <SpiritSubpageHero
        theme="library"
        eyebrow="行囊藏阁"
        title="资源"
        lead="学习网站、AI 相关网站等常用链接，像整理行囊一样收藏与检索技术资源。"
        stats={[
          { label: '资源总数', value: items.length },
          { label: '置顶书签', value: pinnedCount },
          { label: '分类维度', value: categoryCount },
        ]}
      />

      <div className="sg-resource-search-wrap sg-enter">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索名称、描述或标签..."
          className="sg-form-input sg-resource-search"
          aria-label="搜索资源"
        />
      </div>

      <ResourceToolbar
        categories={categories}
        filter={filter}
        isManageMode={isManageMode}
        isExploring={isExploring}
        candidateCount={candidateItems.length}
        onFilterChange={setFilter}
        onToggleManage={() => setIsManageMode(!isManageMode)}
        onAdd={() => openForm()}
        onOpenCandidates={() => {
          setDiscoveredItems(candidateItems)
          setShowDiscoveryModal(true)
        }}
        onExplore={handleExplore}
        onExport={handleExport}
        onImport={handleImport}
      />

      <ResourcePinnedRail items={items} onVisit={handlePinnedVisit} />

      {filteredItems.length === 0 ? (
        <div className="sg-state sg-state--empty sg-enter">
          <p className="sg-state__message">
            {items.length === 0
              ? '暂无资源，点击上方「添加」添加第一个'
              : searchQuery.trim()
                ? '未找到匹配的资源，尝试调整搜索关键词'
                : '当前分类暂无资源'}
          </p>
          {items.length === 0 ? (
            <button type="button" className="sg-btn sg-btn--ghost" onClick={() => openForm()}>
              添加第一个
            </button>
          ) : null}
        </div>
      ) : (
        <ResourceShelfGrid
          items={filteredItems}
          categories={categories}
          filter={filter}
          searchQuery={searchQuery}
          nowTs={nowTs}
          hoveredId={hoveredId}
          isManageMode={isManageMode}
          selectedIds={selectedIds}
          copyingId={copyingId}
          deleteConfirmId={deleteConfirmId}
          onHoverChange={setHoveredId}
          handlers={cardHandlers}
        />
      )}

      {isManageMode && selectedIds.size > 0 ? (
        <div className="sg-resource-batch-bar sg-enter">
          <span className="sg-resource-batch-bar__label">
            已选择 <strong>{selectedIds.size}</strong> 项
          </span>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={handleBatchDelete}>
            批量删除
          </button>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={() => setSelectedIds(new Set())}>
            取消选择
          </button>
        </div>
      ) : null}

      <ResourceConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      <ResourceDiscoveryModal
        isOpen={showDiscoveryModal}
        isMobile={isMobile}
        modalPad={modalPad}
        overlayPad={overlayPad}
        discoveredItems={discoveredItems}
        onClose={closeDiscoveryModal}
        onAddToLibrary={(item) => void addToLibrary(item)}
        onRemoveItem={handleDiscoveryRemove}
      />

      {toastMessage ? (
        <div className="sg-resource-toast sg-enter" role="status">
          {toastMessage}
        </div>
      ) : null}

      <ResourceFormModal
        isOpen={showForm}
        isMobile={isMobile}
        modalPad={modalPad}
        overlayPad={overlayPad}
        editingId={editingId}
        formData={formData}
        categories={categories}
        isFetchingMeta={isFetchingMeta}
        onClose={closeForm}
        onSubmit={(e) => void handleSubmit(e)}
        onFormChange={setFormData}
        onFetchMeta={fetchMeta}
        onAutoFill={handleAutoFill}
      />
    </div>
  )
}
