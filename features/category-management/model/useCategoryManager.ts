import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/api/http';

type UseCategoryManagerOptions = {
  initialCategories: string[];
  onChange?: () => void;
};

export function useCategoryManager({ initialCategories, onChange }: UseCategoryManagerOptions) {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [updatedCategory, setUpdatedCategory] = useState('');

  useEffect(() => {
    setCategories((prev) => {
      const merged = new Set(prev);
      initialCategories.forEach((category) => merged.add(category));
      return Array.from(merged);
    });
  }, [initialCategories]);

  const handleAddCategory = useCallback(async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast.error('Введите название категории');
      return;
    }
    if (categories.includes(trimmed)) {
      toast.error('Такая категория уже существует');
      return;
    }
    try {
      const response = await apiFetch('/vault/categories/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updatedName: trimmed }),
      });
      if (response.status === 200) {
        setCategories((prev) => [...prev, trimmed]);
        setNewCategory('');
        toast.success('Категория добавлена');
        onChange?.();
      } else {
        toast.error('Не удалось добавить категорию');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  }, [categories, newCategory, onChange]);

  const startEdit = useCallback((category: string) => {
    setEditingCategory(category);
    setUpdatedCategory(category);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingCategory(null);
    setUpdatedCategory('');
  }, []);

  const handleUpdateCategory = useCallback(async () => {
    if (!editingCategory) return;
    const trimmed = updatedCategory.trim();
    if (!trimmed) {
      toast.error('Введите новое название');
      return;
    }
    if (categories.includes(trimmed)) {
      toast.error('Такая категория уже существует');
      return;
    }
    try {
      const response = await apiFetch('/vault/categories/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingCategory, updatedName: trimmed }),
      });
      if (response.status === 200) {
        setCategories((prev) =>
          prev.map((category) => (category === editingCategory ? trimmed : category)),
        );
        toast.success('Категория обновлена');
        cancelEdit();
        onChange?.();
      } else {
        toast.error('Не удалось обновить категорию');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  }, [categories, editingCategory, updatedCategory, cancelEdit, onChange]);

  const handleDeleteCategory = useCallback(
    async (category: string) => {
      try {
        const response = await apiFetch('/vault/categorie/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updatedName: category }),
        });
        if (response.status === 200) {
          setCategories((prev) => prev.filter((item) => item !== category));
          toast.success('Категория удалена');
          onChange?.();
        } else {
          toast.error('Не удалось удалить категорию');
        }
      } catch (error) {
        toast.error('Ошибка подключения к серверу');
      }
    },
    [onChange],
  );

  return {
    categories,
    newCategory,
    setNewCategory,
    editingCategory,
    updatedCategory,
    setUpdatedCategory,
    handleAddCategory,
    startEdit,
    cancelEdit,
    handleUpdateCategory,
    handleDeleteCategory,
  };
}
