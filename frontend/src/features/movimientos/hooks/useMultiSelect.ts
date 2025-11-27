import { useState, useCallback } from 'react';

export function useMultiSelect<T extends { id: number }>(items: T[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleItem = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  }, [items, selectedIds.size]);

  const isSelected = useCallback(
    (id: number) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    toggleItem,
    toggleAll,
    isSelected,
    isAllSelected,
    clearSelection,
    getSelectedItems,
  };
}