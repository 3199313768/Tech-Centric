"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  getInitialResources,
  type ResourceItem,
} from "@/data/initialResources";

const STORAGE_KEY = "tech-centric-resources";
const CANDIDATE_KEY = "tech-centric-candidates";

export type { ResourceItem };

const CATEGORY_LABELS: Record<string, string> = {
  learning: "学习",
  ai: "AI",
  tools: "工具",
  design: "设计",
  other: "其他",
};

const CATEGORY_ICONS: Record<string, string> = {
  learning: "📚",
  ai: "🤖",
  tools: "🛠️",
  design: "🎨",
  other: "🔗",
};

function loadFromStorage(): ResourceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const initial = getInitialResources();
    if (!raw || raw === "[]") {
      saveToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveToStorage(initial);
      return initial;
    }
    // 补全缺失的关键字段，防止旧数据导致排序或渲染崩溃
    return parsed.map((item) => ({
      ...item,
      createdAt: item.createdAt || Date.now(),
      clickCount: item.clickCount || 0,
      category: item.category || "other",
    }));
  } catch {
    const initial = getInitialResources();
    saveToStorage(initial);
    return initial;
  }
}

function saveToStorage(items: ResourceItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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

function getFaviconUrl(url: string): string {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`)
      .hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return "";
  }
}

function ResourceFavicon({
  url,
  category,
  name,
}: {
  url: string;
  category: ResourceItem["category"];
  name: string;
}) {
  const [faviconFailed, setFaviconFailed] = useState(false);
  const faviconUrl = getFaviconUrl(url);
  const useFavicon = faviconUrl && !faviconFailed;

  return (
    <div
      style={{
        background: "var(--color-ai-card-icon-bg)",
        width: "60px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        border: "1px solid var(--color-ai-card-icon-border)",
        overflow: "hidden",
      }}
    >
      {useFavicon ? (
        // eslint-disable-next-line @next/next/no-img-element -- 动态外部 favicon，无法用 next/image 预配置
        <img
          src={faviconUrl}
          alt=""
          width={48}
          height={48}
          onError={(e) => {
            // First failure: try falling back to standard /favicon.ico
            if (!faviconUrl.includes("google.com")) {
              setFaviconFailed(true);
              return;
            }
            try {
              const origin = new URL(
                url.startsWith("http") ? url : `https://${url}`,
              ).origin;
              const fallbackUrl = `${origin}/favicon.ico`;
              const img = e.currentTarget as HTMLImageElement;
              if (img.src !== fallbackUrl) {
                img.src = fallbackUrl;
              } else {
                setFaviconFailed(true);
              }
            } catch {
              setFaviconFailed(true);
            }
          }}
          style={{ objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontSize: "2rem" }}>
          {name?.trim()?.[0]?.toUpperCase() ?? CATEGORY_ICONS[category]}
        </span>
      )}
    </div>
  );
}

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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "var(--color-ai-card-bg)",
          border: "1px solid var(--color-cyan-50)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontSize: "1.2rem",
            color: "var(--color-cyan)",
            marginBottom: "16px",
            fontFamily: "var(--font-space-mono), monospace",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid var(--color-ai-tag-border)",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              background: "var(--color-cyan)",
              color: "var(--color-bg)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: "0 0 15px var(--color-cyan-30)",
            }}
          >
            确认
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const SearchHighlight = ({ text, query }: { text: string; query: string }) => {
  const safeText = String(text || "");
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return <span>{safeText}</span>;

  let parts: string[] = [];
  try {
    const regex = new RegExp(
      `(${trimmedQuery.replace(/[-[\]{}()*+?.,\\\\^$|#\\s]/g, "\\\\$&")})`,
      "gi",
    );
    parts = safeText.split(regex);
  } catch {
    return <span>{safeText}</span>;
  }

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: "var(--color-cyan-30)",
              color: "var(--color-cyan)",
              padding: "0 2px",
              borderRadius: "2px",
            }}
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export function ResourceLinks() {
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

  useEffect(() => {
    const data = loadFromStorage();
    // Extract unique categories
    const cats = Array.from(
      new Set([
        ...["learning", "ai", "tools", "design", "other"],
        ...data.map((i) => i.category),
      ]),
    );
    setCategories(cats);
    setItems(data);
    setCandidateItems(loadCandidates());
  }, []);

  {
    /* AI 发现结果弹窗 */
  }
  {
    showDiscoveryModal && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
        }}
        onClick={() => setShowDiscoveryModal(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: "100%",
            maxWidth: "800px",
            maxHeight: "80vh",
            background: "var(--color-ai-card-bg)",
            border: "1px solid var(--color-cyan-50)",
            borderRadius: "20px",
            padding: "40px",
            overflowY: "auto",
            boxShadow: "0 0 100px rgba(0, 217, 255, 0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "32px",
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
                style={{
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-ai-card-border)",
                  background: "rgba(255,255,255,0.03)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
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
                        background: "rgba(0, 217, 255, 0.1)",
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
                <button
                  onClick={() => addToLibrary(item)}
                  style={{
                    padding: "8px 16px",
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
    );
  }

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

  const persist = useCallback((next: ResourceItem[]) => {
    setItems(next);
    saveToStorage(next);
    // Update categories list just in case
    const cats = Array.from(
      new Set([
        ...["learning", "ai", "tools", "design", "other"],
        ...next.map((i) => i.category),
      ]),
    );
    setCategories(cats);
  }, []);

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

  const addToLibrary = (item: ResourceItem) => {
    if (items.find((i) => i.url === item.url)) {
      alert("资源已存在于库中");
      return;
    }
    const next = [...items, { ...item, createdAt: Date.now() }];
    persist(next);
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
    } catch (err) {
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

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    persist(
      items.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i)),
    );
  };

  const incrementClick = (id: string) => {
    persist(
      items.map((i) =>
        i.id === id ? { ...i, clickCount: (i.clickCount || 0) + 1 } : i,
      ),
    );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const url = formData.url.trim();
    if (!name || !url) return;

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

    const tags = formData.tags.filter((t) => t.trim()).map((t) => t.trim());
    if (editingId) {
      persist(
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
    } else {
      persist([
        ...items,
        {
          id: generateId(),
          name,
          url: normalizedUrl,
          description: formData.description.trim() || undefined,
          category: formData.category,
          tags: tags.length > 0 ? tags : undefined,
          createdAt: Date.now(),
        },
      ]);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    setDeleteConfirmId(null);
  };

  const handleBatchDelete = () => {
    setConfirmConfig({
      isOpen: true,
      title: "批量删除确认",
      message: `确定要删除选中的 ${selectedIds.size} 项资源吗？此操作不可撤销。`,
      onConfirm: () => {
        persist(items.filter((i) => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
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
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text) as Partial<ResourceItem>[];
        if (!Array.isArray(imported)) throw new Error("Invalid format");

        const next = [...items];
        let addedCount = 0;
        let updatedCount = 0;
        let invalidCount = 0;

        imported.forEach((item) => {
          if (!item.name || !item.url) {
            invalidCount++;
            return;
          }
          if (!item.id) {
            item.id = generateId();
          }
          const index = next.findIndex((i) => i.id === item.id);
          if (index > -1) {
            next[index] = { ...next[index], ...(item as ResourceItem) };
            updatedCount++;
          } else {
            next.push({
              ...(item as ResourceItem),
              createdAt: item.createdAt || Date.now(),
              clickCount: item.clickCount || 0,
            });
            addedCount++;
          }
        });

        persist(next);
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

  return (
    <div
      style={{
        padding: "120px 24px 80px",
        maxWidth: "1200px",
        margin: "0 auto",
        minHeight: "100vh",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: "40px", textAlign: "center" }}
      >
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.2rem",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          学习网站、AI 相关网站等常用链接
          {items.length > 0 && (
            <span
              style={{
                display: "block",
                fontSize: "12px",
                opacity: 0.5,
                marginTop: "8px",
              }}
            >
              已索引 {items.length} 个技术资源
            </span>
          )}
        </p>
      </motion.div>

      {/* 搜索框 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{
          marginBottom: "20px",
          maxWidth: "400px",
          margin: "0 auto 20px",
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索名称、描述或标签..."
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: "14px",
            background: "var(--color-ai-tag-bg)",
            border: "1px solid var(--color-ai-tag-border)",
            borderRadius: "10px",
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
      </motion.div>

      {/* 分类筛选 + 添加按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        {(["all", ...categories] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontFamily: "var(--font-space-mono), monospace",
              fontWeight: filter === key ? "bold" : "normal",
              color:
                filter === key
                  ? "var(--color-cyan)"
                  : "var(--color-text-secondary)",
              backgroundColor:
                filter === key
                  ? "var(--color-cyan-10)"
                  : "var(--color-ai-tag-bg)",
              border: `1px solid ${filter === key ? "var(--color-cyan-50)" : "var(--color-ai-tag-border)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {key === "all" ? "全部" : CATEGORY_LABELS[key] || key}
          </button>
        ))}
        <div
          style={{
            width: "1px",
            height: "24px",
            background: "var(--color-ai-tag-border)",
            margin: "0 8px",
          }}
        />
        <button
          onClick={() => setIsManageMode(!isManageMode)}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontFamily: "var(--font-space-mono), monospace",
            color: isManageMode
              ? "var(--color-cyan)"
              : "var(--color-text-muted)",
            backgroundColor: isManageMode
              ? "var(--color-cyan-10)"
              : "transparent",
            border: `1px solid ${isManageMode ? "var(--color-cyan-50)" : "var(--color-ai-tag-border)"}`,
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {isManageMode ? "退出管理" : "批量管理"}
        </button>
        <button
          onClick={() => openForm()}
          style={{
            padding: "8px 20px",
            fontSize: "13px",
            fontFamily: "var(--font-space-mono), monospace",
            fontWeight: 600,
            color: "var(--color-bg)",
            backgroundColor: "var(--color-cyan)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginLeft: "8px",
          }}
        >
          + 添加
        </button>

        <button
          onClick={() => {
            setDiscoveredItems(candidateItems);
            setShowDiscoveryModal(true);
          }}
          disabled={candidateItems.length === 0}
          title={candidateItems.length === 0 ? "暂无待选灵感" : "查看待选灵感"}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            background:
              candidateItems.length > 0
                ? "rgba(168, 85, 247, 0.1)"
                : "var(--color-ai-tag-bg)",
            border: `1px solid ${candidateItems.length > 0 ? "rgba(168, 85, 247, 0.3)" : "var(--color-ai-tag-border)"}`,
            borderRadius: "8px",
            color:
              candidateItems.length > 0 ? "#a855f7" : "var(--color-text-muted)",
            cursor: candidateItems.length > 0 ? "pointer" : "not-allowed",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: candidateItems.length > 0 ? 1 : 0.6,
          }}
        >
          💡 灵感待选{" "}
          {candidateItems.length > 0 ? `(${candidateItems.length})` : ""}
        </button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExplore}
          disabled={isExploring}
          title="AI 灵感发现"
          style={{
            padding: "8px 20px",
            fontSize: "13px",
            fontFamily: "var(--font-space-mono), monospace",
            fontWeight: 700,
            color: "var(--color-bg)",
            background: "linear-gradient(135deg, #a855f7 0%, var(--color-cyan) 100%)",
            border: "none",
            borderRadius: "10px",
            cursor: isExploring ? "wait" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          {isExploring ? "正在扫描趋势..." : "✨ AI 发现"}
        </motion.button>
        <button
          onClick={handleExport}
          title="导出备份 (JSON)"
          style={{
            padding: "8px",
            fontSize: "16px",
            background: "transparent",
            border: "1px solid var(--color-ai-tag-border)",
            borderRadius: "8px",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📥
        </button>
        <label
          title="导入备份"
          style={{
            padding: "8px",
            fontSize: "16px",
            background: "transparent",
            border: "1px solid var(--color-ai-tag-border)",
            borderRadius: "8px",
            cursor: "pointer",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          📤
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>
      </motion.div>

      {/* 批量操作工具栏 */}
      {isManageMode && selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "var(--color-ai-card-bg)",
            border: "1px solid var(--color-cyan-50)",
            borderRadius: "12px",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            style={{ fontSize: "14px", color: "var(--color-text-primary)" }}
          >
            已选择 <strong>{selectedIds.size}</strong> 项
          </span>
          <button
            onClick={handleBatchDelete}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              color: "var(--color-red, #ef4444)",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            批量删除
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              background: "transparent",
              border: "1px solid var(--color-ai-tag-border)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            取消选择
          </button>
        </motion.div>
      )}

      {/* 空状态 */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "60px 24px",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
            {items.length === 0
              ? "暂无资源，点击上方「添加」添加第一个"
              : searchQuery.trim()
                ? "未找到匹配的资源，尝试调整搜索关键词"
                : "当前分类暂无资源"}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => openForm()}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                color: "var(--color-cyan)",
                backgroundColor: "var(--color-cyan-10)",
                border: "1px solid var(--color-cyan-50)",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "var(--font-space-mono), monospace",
              }}
            >
              添加第一个
            </button>
          )}
        </motion.div>
      )}

      {/* 卡片列表 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(280px, 30vw, 360px), 1fr))",
          gap: "24px",
        }}
      >
        {filteredItems.map((item) => (
          <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              position: "relative",
              background: "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${item.isPinned ? "var(--color-cyan-70)" : hoveredId === item.id ? "rgba(0, 217, 255, 0.4)" : "rgba(255, 255, 255, 0.05)"}`,
              borderRadius: "20px",
              padding: "32px 32px 24px",
              display: "block",
              overflow: "hidden",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              transform:
                hoveredId === item.id ? "translateY(-8px)" : "translateY(0)",
              boxShadow: item.isPinned
                ? `0 10px 30px rgba(0, 217, 255, 0.15)`
                : hoveredId === item.id
                  ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(0, 217, 255, 0.12)`
                  : `0 4px 20px rgba(0,0,0,0.2)`,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* 顶层光晕层 (Ambient Glow) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse at 50% 120%, rgba(0,217,255,0.15) 0%, transparent 60%)",
                opacity: hoveredId === item.id ? 1 : 0,
                transition: "opacity 0.5s ease",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
            {/* 内容封装层提升层级以防被光效遮挡 */}
            <div style={{ position: "relative", zIndex: 1, width: "100%", display: "block" }}>
            {item.isPinned && (
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  left: "-30px",
                  background: "var(--color-cyan)",
                  color: "var(--color-bg)",
                  padding: "15px 30px 5px",
                  transform: "rotate(-45deg)",
                  fontSize: "10px",
                  fontWeight: "bold",
                  zIndex: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                PINNED
              </div>
            )}
            {Date.now() - item.createdAt < 7 * 24 * 60 * 60 * 1000 &&
              !item.isPinned && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "var(--color-red, #ef4444)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: "bold",
                    zIndex: 2,
                  }}
                >
                  NEW
                </div>
              )}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, var(--color-cyan), transparent)",
                opacity: hoveredId === item.id ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
            {isManageMode && (
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  zIndex: 10,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => {
                    const next = new Set(selectedIds);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    setSelectedIds(next);
                  }}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    accentColor: "var(--color-cyan)",
                  }}
                />
              </div>
            )}
            <div
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                width: "20px",
                height: "20px",
                borderTop: `2px solid ${hoveredId === item.id ? "var(--color-cyan)" : "transparent"}`,
                borderRight: `2px solid ${hoveredId === item.id ? "var(--color-cyan)" : "transparent"}`,
                transition: "all 0.3s ease",
              }}
            />

            {/* 分级操作按钮: Ghost UIs */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                display: "flex",
                gap: "8px",
                opacity: hoveredId === item.id ? 1 : 0,
                transition: "opacity 0.2s ease",
                zIndex: 20,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "var(--color-cyan-10)" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleCopy(e, item.url, item.id)}
                title="复制链接"
                style={{
                  padding: "4px",
                  fontSize: "14px",
                  color: copyingId === item.id ? "var(--color-green, #10b981)" : "var(--color-text-muted)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {copyingId === item.id ? "✅" : "📄"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: item.isPinned ? "var(--color-cyan)" : "var(--color-cyan-10)" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(e, item.id);
                }}
                title={item.isPinned ? "取消置顶" : "置顶"}
                style={{
                  padding: "4px",
                  fontSize: "14px",
                  color: item.isPinned ? "var(--color-bg)" : "var(--color-text-muted)",
                  background: item.isPinned ? "var(--color-cyan)" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                📌
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "var(--color-cyan-10)" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  openForm(item);
                }}
                title="编辑"
                style={{
                  padding: "4px",
                  fontSize: "14px",
                  color: "var(--color-text-muted)",
                  background: "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                ✏️
              </motion.button>
              {deleteConfirmId === item.id ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.2)" }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    title="确认删除"
                    style={{
                      padding: "4px",
                      fontSize: "14px",
                      color: "var(--color-red, #ef4444)",
                      background: "rgba(239,68,68,0.1)",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    🗑️✓
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(null);
                    }}
                    title="取消"
                    style={{
                      padding: "4px",
                      fontSize: "14px",
                      color: "var(--color-text-muted)",
                      background: "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    ❌
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.1)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(item.id);
                  }}
                  title="删除"
                  style={{
                    padding: "4px",
                    fontSize: "14px",
                    color: "var(--color-text-muted)",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  🗑️
                </motion.button>
              )}
            </div>

            <div style={{ paddingRight: "12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <ResourceFavicon
                    url={item.url}
                    category={item.category}
                    name={item.name}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    background: "var(--color-cyan-10)",
                    color: "var(--color-cyan)",
                    borderRadius: "20px",
                    fontFamily: "var(--font-space-mono), monospace",
                    letterSpacing: "0.5px",
                    border: "1px solid var(--color-cyan-20)",
                  }}
                >
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "12px",
                  color: "var(--color-text-primary)",
                }}
              >
                <SearchHighlight text={item.name} query={searchQuery} />
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  marginBottom: "12px",
                  minHeight: item.description ? "auto" : "24px",
                }}
              >
                {item.description ? (
                  <SearchHighlight
                    text={item.description}
                    query={searchQuery}
                  />
                ) : (
                  <span style={{ opacity: 0.5 }}>{item.url}</span>
                )}
              </p>

              {(item.tags ?? []).length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "12px",
                  }}
                >
                  {(item.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleTagClick(tag);
                      }}
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        background: "var(--color-ai-tag-bg)",
                        color: "var(--color-text-secondary)",
                        borderRadius: "6px",
                        border: "1px solid var(--color-ai-tag-border)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--color-cyan-50)";
                        e.currentTarget.style.color = "var(--color-cyan)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--color-ai-tag-border)";
                        e.currentTarget.style.color =
                          "var(--color-text-secondary)";
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                <span title="访问次数">🔥 {item.clickCount || 0}</span>
                <span title="添加日期">
                  📅 {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  incrementClick(item.id);
                }}
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-cyan)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                  cursor: "pointer",
                  marginTop: "12px",
                }}
              >
                访问 →
                {item.clickCount ? (
                  <span
                    style={{
                      fontSize: "10px",
                      opacity: 0.6,
                      marginLeft: "4px",
                    }}
                  >
                    ({item.clickCount} 次访问)
                  </span>
                ) : null}
              </a>
            </div>
          </div>
          </motion.div>
        ))}
      </div>

      {/* 表单弹窗 */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 全局 Toast 通知 */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          style={{
            position: "fixed",
            top: "24px",
            left: "50%",
            zIndex: 9999,
            background: "var(--color-ai-card-bg)",
            color: "var(--color-cyan)",
            border: "1px solid var(--color-cyan-50)",
            padding: "12px 24px",
            borderRadius: "50px",
            boxShadow: "0 10px 30px rgba(0,217,255,0.2)",
            backdropFilter: "blur(10px)",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {toastMessage}
        </motion.div>
      )}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
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
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  名称 *
                </label>
                <input
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
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  URL *
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="url"
                    value={formData.url}
                    onBlur={() => !formData.name && fetchMeta(formData.url)}
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
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  描述（可选）
                </label>
                <textarea
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
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  分类
                </label>
                <select
                  value={
                    categories.includes(formData.category)
                      ? formData.category
                      : "new"
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "new") {
                      const newCat = prompt("请输入新分类名称");
                      if (newCat) {
                        setCategories((prev) =>
                          Array.from(new Set([...prev, newCat])),
                        );
                        setFormData((f) => ({ ...f, category: newCat }));
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
                      {CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
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
