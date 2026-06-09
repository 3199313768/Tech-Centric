"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { type ResourceItem } from "@/data/initialResources";
import { createClient } from "@/lib/supabase/client";
import { useBreakpoint } from "@/utils/useBreakpoint";
import { SpiritSubpageHero } from "@/components/spirit/SpiritSubpageHero";
import { ResourceToolbar } from "@/components/spirit/resource/ResourceToolbar";
import { ResourcePinnedRail } from "@/components/spirit/resource/ResourcePinnedRail";
import { ResourceShelfGrid } from "@/components/spirit/resource/ResourceShelfGrid";
import type { ResourceCardHandlers } from "@/components/spirit/resource/ResourceCard";
import { RESOURCE_CATEGORY_LABELS } from "@/utils/resourceCategory";

const CANDIDATE_KEY = "tech-centric-candidates";

export type { ResourceItem };

function loadCandidates(): ResourceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CANDIDATE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCandidates(items: ResourceItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CANDIDATE_KEY, JSON.stringify(items));
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

interface FormData {
  name: string;
  url: string;
  description: string;
  category: ResourceItem["category"];
  tags: string[];
}

const emptyForm: FormData = {
  name: "",
  url: "",
  description: "",
  category: "other",
  tags: [],
};

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="sg-modal-backdrop" style={{ zIndex: 2000 }} onClick={onCancel}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="sg-modal-panel"
        style={{ maxWidth: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="sg-modal-title">{title}</h3>
        <p className="sg-page-lead" style={{ marginBottom: "24px", textAlign: "left" }}>
          {message}
        </p>
        <div className="sg-modal-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="sg-btn sg-btn--primary" onClick={onConfirm}>
            确认
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ResourceLinks() {
  const { isMobile, isTablet } = useBreakpoint();
  const modalPad = isMobile ? "20px" : isTablet ? "28px" : "40px";
  const overlayPad = isMobile ? "12px" : "20px";
  const [nowTs] = useState(() => Date.now());
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([
    "learning",
    "ai",
    "tools",
    "design",
    "other",
  ]);
  const [filter, setFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [discoveredItems, setDiscoveredItems] = useState<ResourceItem[]>([]);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [candidateItems, setCandidateItems] = useState<ResourceItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchResources = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.from('resources').select('*');
    if (data && !error) {
      const itemsData = data.map(d => ({
        id: d.id,
        name: d.name,
        url: d.url,
        description: d.description || undefined,
        category: d.category,
        tags: d.tags || undefined,
        createdAt: Number(d.created_at),
        isPinned: d.is_pinned,
        clickCount: d.click_count
      }));
      setItems(itemsData);
      
      const cats = Array.from(
        new Set([
          ...["learning", "ai", "tools", "design", "other"],
          ...itemsData.map((i) => i.category),
        ]),
      );
      setCategories(cats);
    }
  }, []);

  useEffect(() => {
    fetchResources();
    setCandidateItems(loadCandidates());
  }, [fetchResources]);

  // AI 发现结果弹窗
  const discoveryModalContent = showDiscoveryModal ? (
      <div
        className="sg-resource-modal-shell"
        style={{ zIndex: 1500, padding: overlayPad }}
        onClick={() => setShowDiscoveryModal(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sg-resource-modal-panel"
          style={{
            maxWidth: "800px",
            maxHeight: isMobile ? "88dvh" : "80vh",
            padding: modalPad,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="sg-resource-discovery-head"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: isMobile ? "20px" : "32px",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1.8rem",
                  color: "var(--color-cyan)",
                  margin: "0 0 8px",
                }}
              >
                ✨ AI 发现灵感
              </h2>
              <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
                基于高级前端趋势为您探测到的新物种
              </p>
            </div>
            <button
              onClick={() => {
                // 关闭弹窗时，将剩余未入库的项存入候选池
                const nextCandidates = Array.from(
                  new Set(
                    [...candidateItems, ...discoveredItems].map((i) => i.url),
                  ),
                ).map(
                  (url) =>
                    [...candidateItems, ...discoveredItems].find(
                      (i) => i.url === url,
                    )!,
                );
                setCandidateItems(nextCandidates);
                saveCandidates(nextCandidates);
                setShowDiscoveryModal(false);
                
                if (discoveredItems.length > 0) {
                  setToastMessage("✨ 未入库的灵感已自动收纳入“待选池”");
                  setTimeout(() => setToastMessage(null), 3000);
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {discoveredItems.map((item) => (
              <div
                key={item.id}
                className="sg-resource-discovery-item"
                style={{
                  padding: isMobile ? "16px" : "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-ai-card-border)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: isMobile ? "12px" : "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        background: "rgba(180, 58, 36, 0.1)",
                        color: "var(--color-cyan)",
                        borderRadius: "4px",
                        border: "1px solid var(--color-cyan-30)",
                        fontWeight: 600,
                      }}
                    >
                      {(item as ResourceItem & { source?: string }).source ||
                        "AI 发现"}
                    </span>
                    <h4 style={{ margin: 0, fontSize: "1.1rem" }}>
                      {item.name}
                    </h4>
                  </div>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--color-text-muted)",
                      margin: "0 0 12px",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.description}
                  </p>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {item.tags?.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: "11px",
                          padding: "2px 6px",
                          background: "var(--color-ai-tag-bg)",
                          border: "1px solid var(--color-ai-tag-border)",
                          borderRadius: "4px",
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sg-resource-discovery-actions" style={{ display: "flex", gap: "8px", flexDirection: isMobile ? "row" : "column" }}>
                  <button
                    onClick={() => addToLibrary(item)}
                    style={{
                      padding: isMobile ? "10px 14px" : "8px 16px",
                      minHeight: "var(--sg-touch-min)",
                      borderRadius: "6px",
                      background: "var(--color-cyan-10)",
                      border: "1px solid var(--color-cyan-50)",
                      color: "var(--color-cyan)",
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    加入库
                  </button>
                  <button
                    onClick={() => {
                      const nextDiscovered = discoveredItems.filter((i) => i.id !== item.id);
                      setDiscoveredItems(nextDiscovered);
                      const nextCandidates = candidateItems.filter((i) => i.url !== item.url);
                      setCandidateItems(nextCandidates);
                      saveCandidates(nextCandidates);
                    }}
                    style={{
                      padding: isMobile ? "10px 14px" : "8px 16px",
                      minHeight: "var(--sg-touch-min)",
                      borderRadius: "6px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "var(--color-red, #ef4444)",
                      fontSize: "13px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🗑️ 移除
                  </button>
                </div>
              </div>
            ))}
          </div>
          {discoveredItems.length === 0 && (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-muted)",
                padding: "40px",
              }}
            >
              正在为您连接趋势引擎...
            </p>
          )}
        </motion.div>
      </div>
    ) : null;

  const handleCopy = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setFilter("all");
  };

  const handleExplore = async () => {
    setIsExploring(true);
    setDiscoveredItems([]);
    try {
      console.log(
        "Fetching AI exploration from:",
        window.location.origin + "/api/explore",
      );
      const res = await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentResources: items.slice(0, 10).map((i) => ({
            name: i.name,
            description: i.description,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!Array.isArray(data)) throw new Error("返回数据格式异常");

      setDiscoveredItems(data);
      setShowDiscoveryModal(true);
    } catch (err) {
      console.error("Exploration error detail:", err);
      alert(
        `AI 探测失败: ${err instanceof Error ? err.message : "未知错误"}。可能原因：API Key 无额度或网络策略限制。`,
      );
    } finally {
      setIsExploring(false);
    }
  };

  const addToLibrary = async (item: ResourceItem) => {
    if (items.find((i) => i.url === item.url)) {
      alert("资源已存在于库中");
      return;
    }
    const newItem = { ...item, createdAt: Date.now(), isPinned: false, clickCount: 0 };
    setItems((prev) => [...prev, newItem]);
    
    const supabase = createClient();
    await supabase.from('resources').insert([{
      id: newItem.id,
      name: newItem.name,
      url: newItem.url,
      description: newItem.description || null,
      category: newItem.category,
      tags: newItem.tags || null,
      created_at: Number(newItem.createdAt),
      is_pinned: newItem.isPinned,
      click_count: newItem.clickCount
    }]);

    setDiscoveredItems((prev) => prev.filter((i) => i.id !== item.id));

    // 如果是从候选池移过来的，也同步候选池
    const nextCandidates = candidateItems.filter((i) => i.url !== item.url);
    setCandidateItems(nextCandidates);
    saveCandidates(nextCandidates);
  };

  const handleAutoFill = async () => {
    const url = formData.url.trim();
    if (!url) return alert("请先输入 URL");
    setIsFetchingMeta(true);
    try {
      const res = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFormData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        category: data.category || prev.category,
        tags: Array.from(new Set([...prev.tags, ...(data.tags || [])])),
      }));
    } catch {
      alert("AI 填充失败，请手动填写");
    } finally {
      setIsFetchingMeta(false);
    }
  };



  const fetchMeta = async (url: string) => {
    if (!url || !url.includes(".")) return;
    setIsFetchingMeta(true);
    try {
      const response = await fetch(
        `/api/meta?url=${encodeURIComponent(url.startsWith("http") ? url : `https://${url}`)}`,
      );
      const data = await response.json();
      if (data.title || data.description) {
        setFormData((prev) => ({
          ...prev,
          name: prev.name || data.title || "",
          description: prev.description || data.description || "",
        }));
      }
    } catch (err) {
      console.error("Failed to fetch meta:", err);
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const togglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(
      items.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i)),
    );
    const supabase = createClient();
    await supabase.from('resources').update({ is_pinned: !item.isPinned }).eq('id', id);
  };

  const incrementClick = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems((prevItems) => 
      prevItems.map((i) =>
        i.id === id ? { ...i, clickCount: (i.clickCount || 0) + 1 } : i,
      )
    );
    const supabase = createClient();
    await supabase.from('resources').update({ click_count: (item.clickCount || 0) + 1 }).eq('id', id);
  };

  const filteredItems = items
    .filter((i) => {
      const queryStr = searchQuery.trim().toLowerCase();
      if (!queryStr) return filter === "all" ? true : i.category === filter;

      const name = (i.name ?? "").toLowerCase();
      const desc = (i.description ?? "").toLowerCase();
      const tagsStr = (i.tags ?? []).join(" ").toLowerCase();

      const categoryMatch = filter === "all" ? true : i.category === filter;
      const searchTerms = queryStr.split(/\s+/);
      const textMatch = searchTerms.every(
        (term) =>
          name.includes(term) || desc.includes(term) || tagsStr.includes(term),
      );

      return categoryMatch && textMatch;
    })
    .sort((a, b) => {
      // Pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by click count
      const clickDiff = (b.clickCount || 0) - (a.clickCount || 0);
      if (clickDiff !== 0) return clickDiff;
      // Then by date
      return b.createdAt - a.createdAt;
    });

  const openForm = (item?: ResourceItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        url: item.url,
        description: item.description ?? "",
        category: item.category,
        tags: item.tags ?? [],
      });
    } else {
      setEditingId(null);
      setFormData(emptyForm);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const url = formData.url.trim();
    if (!name || !url) return;

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const tags = formData.tags.filter((t) => t.trim()).map((t) => t.trim());
    const supabase = createClient();

    if (editingId) {
      setItems(
        items.map((i) =>
          i.id === editingId
            ? {
                ...i,
                name,
                url: normalizedUrl,
                description: formData.description.trim() || undefined,
                category: formData.category,
                tags: tags.length > 0 ? tags : undefined,
              }
            : i,
        ),
      );
      
      await supabase.from('resources').update({
        name,
        url: normalizedUrl,
        description: formData.description.trim() || null,
        category: formData.category,
        tags: tags.length > 0 ? tags : null,
      }).eq('id', editingId);
      
    } else {
      const newId = generateId();
      const newObj = {
          id: newId,
          name,
          url: normalizedUrl,
          description: formData.description.trim() || undefined,
          category: formData.category,
          tags: tags.length > 0 ? tags : undefined,
          createdAt: Date.now(),
          isPinned: false,
          clickCount: 0
      };
      setItems([ ...items, newObj ]);
      
      await supabase.from('resources').insert([{
        id: newObj.id,
        name: newObj.name,
        url: newObj.url,
        description: newObj.description || null,
        category: newObj.category,
        tags: newObj.tags || null,
        created_at: newObj.createdAt,
        is_pinned: newObj.isPinned,
        click_count: newObj.clickCount
      }]);
    }
    closeForm();
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirmId(null);
    const supabase = createClient();
    await supabase.from('resources').delete().eq('id', id);
  };

  const handleBatchDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: "批量删除确认",
      message: `确定要删除选中的 ${selectedIds.size} 项资源吗？此操作不可撤销。`,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedIds);
        setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        
        const supabase = createClient();
        await supabase.from('resources').delete().in('id', idsToDelete);
      },
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resources_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text) as Partial<ResourceItem>[];
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        let addedCount = 0;
        let updatedCount = 0;
        let invalidCount = 0;
        
        const tempNext = [...items];
        
        const processedItems = imported.map((item) => {
          if (!item.name || !item.url) {
            invalidCount++;
            return null;
          }
          return {
             ...(item as ResourceItem),
             id: item.id || generateId(),
          };
        }).filter(Boolean) as ResourceItem[];
        
        processedItems.forEach((item) => {
          const index = tempNext.findIndex((i) => i.id === item.id);
          if (index > -1) {
            tempNext[index] = { ...tempNext[index], ...item };
            updatedCount++;
          } else {
            tempNext.push({
              ...item,
              createdAt: item.createdAt || Date.now(),
              clickCount: item.clickCount || 0,
            });
            addedCount++;
          }
        });

        setItems(tempNext);
        const supabase = createClient();
        const upsertData = tempNext.map(item => ({
            id: item.id,
            name: item.name,
            url: item.url,
            description: item.description || null,
            category: item.category,
            tags: item.tags || null,
            created_at: item.createdAt,
            is_pinned: item.isPinned || false,
            click_count: item.clickCount || 0
        }));
        await supabase.from('resources').upsert(upsertData, { onConflict: 'id' });

        alert(
          `导入完成！\n✅ 新增: ${addedCount} 条\n🔄 更新: ${updatedCount} 条\n❌ 无效跳过: ${invalidCount} 条`,
        );
      } catch (err) {
        console.error("Import error:", err);
        alert("导入失败：文件格式不正确或已损坏");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset
  };

  const pinnedCount = items.filter((i) => i.isPinned).length;
  const categoryCount = new Set(items.map((i) => i.category)).size;

  const cardHandlers: ResourceCardHandlers = {
    onCopy: handleCopy,
    onTogglePin: togglePin,
    onEdit: (e, item) => {
      e.stopPropagation();
      openForm(item);
    },
    onDeleteRequest: (e, id) => {
      e.stopPropagation();
      setDeleteConfirmId(id);
    },
    onDeleteConfirm: (e, id) => {
      e.stopPropagation();
      handleDelete(id);
    },
    onDeleteCancel: (e) => {
      e.stopPropagation();
      setDeleteConfirmId(null);
    },
    onTagClick: handleTagClick,
    onVisit: incrementClick,
    onSelectToggle: (id) => {
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelectedIds(next);
    },
  };

  const handlePinnedVisit = (item: ResourceItem) => {
    incrementClick(item.id);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="sg-page sg-resource-page">
      <SpiritSubpageHero
        theme="library"
        eyebrow="行囊藏阁"
        title="资源"
        lead="学习网站、AI 相关网站等常用链接，像整理行囊一样收藏与检索技术资源。"
        stats={[
          { label: "资源总数", value: items.length },
          { label: "置顶书签", value: pinnedCount },
          { label: "分类维度", value: categoryCount },
        ]}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="sg-resource-search-wrap"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索名称、描述或标签..."
          className="sg-form-input sg-resource-search"
        />
      </motion.div>

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
          setDiscoveredItems(candidateItems);
          setShowDiscoveryModal(true);
        }}
        onExplore={handleExplore}
        onExport={handleExport}
        onImport={handleImport}
      />

      <ResourcePinnedRail items={items} onVisit={handlePinnedVisit} />

      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="sg-state sg-state--empty"
        >
          <p style={{ marginBottom: "20px" }}>
            {items.length === 0
              ? "暂无资源，点击上方「添加」添加第一个"
              : searchQuery.trim()
                ? "未找到匹配的资源，尝试调整搜索关键词"
                : "当前分类暂无资源"}
          </p>
          {items.length === 0 ? (
            <button type="button" className="sg-btn sg-btn--ghost" onClick={() => openForm()}>
              添加第一个
            </button>
          ) : null}
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sg-resource-batch-bar"
        >
          <span style={{ fontSize: "14px", color: "var(--color-text-primary)" }}>
            已选择 <strong>{selectedIds.size}</strong> 项
          </span>
          <button type="button" className="sg-btn sg-btn--ghost" onClick={handleBatchDelete}>
            批量删除
          </button>
          <button
            type="button"
            className="sg-btn sg-btn--ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            取消选择
          </button>
        </motion.div>
      ) : null}

      {/* 表单弹窗 */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />
      
      {discoveryModalContent}

      {/* 全局 Toast 通知 */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="sg-resource-toast"
        >
          {toastMessage}
        </motion.div>
      )}

      {showForm && (
        <div
          className="sg-resource-modal-shell"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            padding: overlayPad,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={closeForm}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-ai-card-border)",
              borderRadius: isMobile ? "16px 16px 0 0" : "16px",
              padding: modalPad,
              maxWidth: "420px",
              width: "100%",
              maxHeight: isMobile ? "92dvh" : "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "24px",
                color: "var(--color-text-primary)",
              }}
            >
              {editingId ? "编辑资源" : "添加资源"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="field-name"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                    cursor: "pointer",
                  }}
                >
                  名称 *
                </label>
                <input
                  id="field-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="例如：MDN"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    background: "var(--color-ai-tag-bg)",
                    border: "1px solid var(--color-ai-tag-border)",
                    borderRadius: "8px",
                    color: "var(--color-text-primary)",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="field-url"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                    cursor: "pointer",
                  }}
                >
                  URL *
                </label>
                <div className="sg-resource-form-url-row">
                  <input
                    id="field-url"
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, url: e.target.value }))
                    }
                    placeholder="https://..."
                    required
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      fontSize: "14px",
                      background: "var(--color-ai-tag-bg)",
                      border: "1px solid var(--color-ai-tag-border)",
                      borderRadius: "8px",
                      color: "var(--color-text-primary)",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fetchMeta(formData.url)}
                    disabled={isFetchingMeta || !formData.url}
                    style={{
                      padding: "0 12px",
                      fontSize: "12px",
                      background: "var(--color-ai-tag-bg)",
                      color: "var(--color-text-secondary)",
                      border: "1px solid var(--color-ai-tag-border)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      opacity: isFetchingMeta || !formData.url ? 0.5 : 1,
                    }}
                  >
                    🔍 抓取
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isFetchingMeta || !formData.url}
                    style={{
                      padding: "0 12px",
                      fontSize: "12px",
                      background: "var(--color-cyan-10)",
                      color: "var(--color-cyan)",
                      border: "1px solid var(--color-cyan-30)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      opacity: isFetchingMeta || !formData.url ? 0.5 : 1,
                    }}
                  >
                    ✨ AI 填充
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label
                  htmlFor="field-desc"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                    cursor: "pointer",
                  }}
                >
                  描述（可选）
                </label>
                <textarea
                  id="field-desc"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="简短描述"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    background: "var(--color-ai-tag-bg)",
                    border: "1px solid var(--color-ai-tag-border)",
                    borderRadius: "8px",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="field-category"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                    cursor: "pointer",
                  }}
                >
                  分类
                </label>
                <select
                  id="field-category"
                  value={formData.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "new") {
                      const newCat = prompt("请输入新分类名称");
                      if (newCat && newCat.trim() !== "") {
                        setFormData((f) => ({ ...f, category: newCat.trim() }));
                      }
                    } else {
                      setFormData((f) => ({
                        ...f,
                        category: val,
                      }));
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    background: "var(--color-ai-tag-bg)",
                    border: "1px solid var(--color-ai-tag-border)",
                    borderRadius: "8px",
                    color: "var(--color-text-primary)",
                    outline: "none",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {RESOURCE_CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                  {!categories.includes(formData.category) && formData.category !== "other" && formData.category && (
                    <option value={formData.category}>{formData.category}</option>
                  )}
                  <option value="new">+ 新增分类...</option>
                </select>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  标签（可选，逗号分隔）
                </label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    padding: "8px",
                    background: "var(--color-ai-tag-bg)",
                    border: "1px solid var(--color-ai-tag-border)",
                    borderRadius: "8px",
                    minHeight: "42px",
                  }}
                >
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "2px 8px",
                        background: "var(--color-cyan-10)",
                        color: "var(--color-cyan)",
                        borderRadius: "4px",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((f) => ({
                            ...f,
                            tags: f.tags.filter((t) => t !== tag),
                          }))
                        }
                        style={{
                          border: "none",
                          background: "none",
                          color: "var(--color-cyan)",
                          cursor: "pointer",
                          padding: "0 2px",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={
                      formData.tags.length === 0 ? "输入标签按回车..." : ""
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !formData.tags.includes(val)) {
                          setFormData((f) => ({
                            ...f,
                            tags: [...f.tags, val],
                          }));
                          e.currentTarget.value = "";
                        }
                      } else if (
                        e.key === "Backspace" &&
                        !e.currentTarget.value &&
                        formData.tags.length > 0
                      ) {
                        setFormData((f) => ({
                          ...f,
                          tags: f.tags.slice(0, -1),
                        }));
                      }
                    }}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      color: "var(--color-text-primary)",
                      outline: "none",
                      fontSize: "14px",
                      minWidth: "60px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    background: "transparent",
                    border: "1px solid var(--color-ai-tag-border)",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    color: "var(--color-bg)",
                    background: "var(--color-cyan)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {editingId ? "保存" : "添加"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
