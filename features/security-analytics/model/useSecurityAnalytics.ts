import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/shared/api/http';
import type { Password } from '@/entities/password/model/types';

export function useSecurityAnalytics(passwords: Password[]) {
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await apiFetch('/vault/entries/count');
        if (response.status === 200) {
          const count = await response.text();
          setTotalCount(parseInt(count, 10));
          return;
        }
      } catch (error) {
        console.error('Failed to fetch count:', error);
      }
      setTotalCount(passwords.length);
    };
    fetchCount();
  }, [passwords.length]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Социальные сети': 0,
      Работа: 0,
      Финансы: 0,
      Развлечения: 0,
      Покупки: 0,
      Другое: 0,
    };

    passwords.forEach((password) => {
      if (counts[password.category] !== undefined) {
        counts[password.category] += 1;
      } else {
        counts.Другое += 1;
      }
    });

    return counts;
  }, [passwords]);

  const weakPasswords = useMemo(() => {
    return passwords.filter((password) => password.password.length < 12).length;
  }, [passwords]);

  const securityScore = useMemo(() => {
    if (passwords.length === 0) return 100;
    const score = Math.max(0, 100 - (weakPasswords / passwords.length) * 100);
    return Math.round(score);
  }, [passwords, weakPasswords]);

  const totalCategories = useMemo(() => {
    return Object.values(categoryCounts).filter((count) => count > 0).length;
  }, [categoryCounts]);

  return {
    totalCount,
    categoryCounts,
    weakPasswords,
    securityScore,
    totalCategories,
  };
}
