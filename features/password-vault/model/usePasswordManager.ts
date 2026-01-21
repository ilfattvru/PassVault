import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Password } from '@/entities/password/model/types';
import { decryptString, encryptString } from '@/shared/lib/crypto/aesgcm';
import { fromBase64, toBase64 } from '@/shared/lib/crypto/base64';
import { apiFetch, isAuthForbidden } from '@/shared/api/http';

type UsePasswordManagerOptions = {
  dek: Uint8Array | null;
  isUnlocked: boolean;
  isActive: boolean;
};

export function usePasswordManager({ dek, isUnlocked, isActive }: UsePasswordManagerOptions) {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [allPasswords, setAllPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const redirectIfForbidden = useCallback((response: Response) => {
    if (isAuthForbidden(response)) {
      window.location.href = '/login';
      return true;
    }
    return false;
  }, []);

  const decryptEntryPassword = useCallback(
    async (item: any) => {
      if (!dek) {
        throw new Error('vault_locked');
      }
      if (!item.passwordCipher || !item.passwordIv) {
        throw new Error('missing_password_cipher');
      }
      const cipherBytes = fromBase64(item.passwordCipher);
      const ivBytes = fromBase64(item.passwordIv);
      return decryptString(cipherBytes, ivBytes, dek);
    },
    [dek],
  );

  const mapEntry = useCallback(
    async (item: any) => ({
      id: item.id.toString(),
      title: item.title,
      username: item.email,
      password: await decryptEntryPassword(item),
      url: item.website,
      category: item.categoryName,
      notes: item.note || '',
      createdAt: Date.now(),
    }),
    [decryptEntryPassword],
  );

  const loadAllPasswords = useCallback(async () => {
    if (!dek) return;
    try {
      const response = await apiFetch('/vault/entries/all');
      if (redirectIfForbidden(response)) return;
      if (response.status === 200) {
        const data = await response.json();
        const formattedPasswords = await Promise.all(data.map(mapEntry));
        setAllPasswords(formattedPasswords);
        setPasswords(formattedPasswords);
      }
    } catch (error) {
      console.error('Failed to load passwords:', error);
      toast.error('Не удалось расшифровать пароли');
    }
  }, [dek, mapEntry, redirectIfForbidden]);

  useEffect(() => {
    if (!isUnlocked) {
      setAllPasswords([]);
      setPasswords([]);
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (isUnlocked && isActive) {
      loadAllPasswords();
    }
  }, [isUnlocked, isActive, loadAllPasswords]);

  useEffect(() => {
    if (!isUnlocked || !isActive) {
      setPasswords([]);
      return;
    }
    if (selectedCategory === 'All') {
      setPasswords(allPasswords);
    } else {
      const getCategoryNameInRussian = (category: string) => {
        const categoryMap: { [key: string]: string } = {
          Social: 'Социальные сети',
          Work: 'Работа',
          Finance: 'Финансы',
          Entertainment: 'Развлечения',
          Shopping: 'Покупки',
          Other: 'Другое',
        };
        return categoryMap[category] || category;
      };
      const loadCategoryPasswords = async () => {
        if (!dek) return;
        try {
          const response = await apiFetch(
            `/vault/entries?categoryName=${encodeURIComponent(
              getCategoryNameInRussian(selectedCategory),
            )}`,
          );
          if (redirectIfForbidden(response)) return;
          if (response.status === 200) {
            const data = await response.json();
            const formattedPasswords = await Promise.all(data.map(mapEntry));
            setPasswords(formattedPasswords);
          }
        } catch (error) {
          console.error('Failed to load passwords:', error);
          toast.error('Не удалось расшифровать пароли');
        }
      };

      if (allPasswords.length > 0) {
        loadCategoryPasswords();
      }
    }
  }, [selectedCategory, allPasswords, isUnlocked, isActive, dek, mapEntry, redirectIfForbidden]);

  const savePassword = useCallback(
    async (passwordData: Omit<Password, 'id' | 'createdAt'>, editingId?: string) => {
      if (!dek) {
        toast.error('Хранилище заблокировано');
        return false;
      }

      let passwordCipher = '';
      let passwordIv = '';
      try {
        const encrypted = await encryptString(passwordData.password, dek);
        passwordCipher = toBase64(encrypted.cipherBytes);
        passwordIv = toBase64(encrypted.iv);
      } catch (error) {
        toast.error('Не удалось зашифровать пароль');
        return false;
      }

      try {
        const response = await apiFetch(
          editingId ? `/vault/entries/update/${editingId}` : '/vault/entries/create',
          {
            method: editingId ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: editingId ?? 0,
              title: passwordData.title,
              website: passwordData.url || '',
              email: passwordData.username,
              categoryName: passwordData.category,
              passwordCipher,
              passwordIv,
              note: passwordData.notes || '',
            }),
          },
        );

        if (redirectIfForbidden(response)) return false;
        if (response.status === 200) {
          await loadAllPasswords();
          toast.success(editingId ? 'Пароль обновлен успешно' : 'Пароль сохранен успешно');
          return true;
        }
        toast.error(editingId ? 'Не удалось обновить пароль' : 'Не удалось сохранить пароль');
      } catch (error) {
        toast.error('Ошибка подключения к серверу');
      }
      return false;
    },
    [dek, loadAllPasswords, redirectIfForbidden],
  );

  const deletePassword = useCallback(
    async (id: string) => {
      try {
        const response = await apiFetch(`/vault/entries/${id}`, {
          method: 'DELETE',
        });
        if (redirectIfForbidden(response)) return false;
        if (response.status === 200) {
          await loadAllPasswords();
          toast.success('Пароль удален успешно');
          return true;
        }
        toast.error('Не удалось удалить пароль');
      } catch (error) {
        toast.error('Ошибка подключения к серверу');
      }
      return false;
    },
    [loadAllPasswords, redirectIfForbidden],
  );

  const filteredPasswords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return passwords.filter((password) => {
      const matchesSearch =
        password.title.toLowerCase().includes(query) ||
        password.username.toLowerCase().includes(query) ||
        (password.url && password.url.toLowerCase().includes(query));
      return matchesSearch;
    });
  }, [passwords, searchQuery]);

  const getCategoryCount = useCallback(
    (category: string) => {
      if (category === 'All') return allPasswords.length;
      return allPasswords.filter((password) => password.category === category).length;
    },
    [allPasswords],
  );

  return {
    passwords,
    allPasswords,
    filteredPasswords,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loadAllPasswords,
    savePassword,
    deletePassword,
    getCategoryCount,
  };
}
