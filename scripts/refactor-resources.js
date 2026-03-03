const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/components/ResourceLinks.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Imports and storage keys
code = code.replace(
`import { useState, useEffect, useCallback } from "react";
import {
  getInitialResources,
  type ResourceItem,
} from "@/data/initialResources";

const STORAGE_KEY = "tech-centric-resources";
const CANDIDATE_KEY = "tech-centric-candidates";`,
`import { useState, useEffect, useCallback } from "react";
import { type ResourceItem } from "@/data/initialResources";
import { createClient } from "@/lib/supabase/client";

const CANDIDATE_KEY = "tech-centric-candidates";`
);

// 2. Remove loadFromStorage and saveToStorage
code = code.replace(/function loadFromStorage\(\)[\s\S]*?function saveToStorage[\s\S]*?\}\n/, '');

// 3. useEffect Initialization
code = code.replace(
`  useEffect(() => {
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
  }, []);`,
`  const fetchResources = useCallback(async () => {
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
  }, [fetchResources]);`
);

// 4. persist removal
code = code.replace(
`  const persist = useCallback((next: ResourceItem[]) => {
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
  }, []);\n\n`,
``);

// 5. addToLibrary
code = code.replace(
`  const addToLibrary = (item: ResourceItem) => {
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
  };`,
`  const addToLibrary = async (item: ResourceItem) => {
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
  };`
);

// 6. togglePin
code = code.replace(
`  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    persist(
      items.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i)),
    );
  };`,
`  const togglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems(
      items.map((i) => (i.id === id ? { ...i, isPinned: !i.isPinned } : i)),
    );
    const supabase = createClient();
    await supabase.from('resources').update({ is_pinned: !item.isPinned }).eq('id', id);
  };`
);

// 7. incrementClick
code = code.replace(
`  const incrementClick = (id: string) => {
    persist(
      items.map((i) =>
        i.id === id ? { ...i, clickCount: (i.clickCount || 0) + 1 } : i,
      ),
    );
  };`,
`  const incrementClick = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setItems((prevItems) => 
      prevItems.map((i) =>
        i.id === id ? { ...i, clickCount: (i.clickCount || 0) + 1 } : i,
      )
    );
    const supabase = createClient();
    await supabase.from('resources').update({ click_count: (item.clickCount || 0) + 1 }).eq('id', id);
  };`
);

// 8. CRUD large block (handleSubmit to handleExport)
code = code.replace(
`  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const url = formData.url.trim();
    if (!name || !url) return;

    const normalizedUrl = url.startsWith("http") ? url : \`https://\${url}\`;

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
      message: \`确定要删除选中的 \${selectedIds.size} 项资源吗？此操作不可撤销。\`,
      onConfirm: () => {
        persist(items.filter((i) => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };`,
`  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const url = formData.url.trim();
    if (!name || !url) return;

    const normalizedUrl = url.startsWith("http") ? url : \`https://\${url}\`;
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
      message: \`确定要删除选中的 \${selectedIds.size} 项资源吗？此操作不可撤销。\`,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedIds);
        setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
        
        const supabase = createClient();
        await supabase.from('resources').delete().in('id', idsToDelete);
      },
    });
  };`
);

// 9. handleImport
code = code.replace(
`        processedItems.forEach((item) => {
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

        persist(tempNext);
        alert(
          \`导入完成！\\n✅ 新增: \${addedCount} 条\\n🔄 更新: \${updatedCount} 条\\n❌ 无效跳过: \${invalidCount} 条\`,
        );`,
`        processedItems.forEach((item) => {
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
          \`导入完成！\\n✅ 新增: \${addedCount} 条\\n🔄 更新: \${updatedCount} 条\\n❌ 无效跳过: \${invalidCount} 条\`,
        );`
);

fs.writeFileSync(filePath, code);
console.log('Refactoring completed successfully.');
