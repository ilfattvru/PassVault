import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Key, AlertTriangle, FolderOpen, TrendingUp, Info, Shield } from 'lucide-react';
import type { Password } from './PasswordItem';

interface DashboardProps {
  passwords: Password[];
}

export function Dashboard({ passwords }: DashboardProps) {
  const [totalCount, setTotalCount] = useState(0);

  // Get total count from backend
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('http://localhost:8080/vault/entries/count', {
          credentials: 'include',
        });
        if (response.status === 200) {
          const count = await response.text();
          setTotalCount(parseInt(count));
        }
      } catch (error) {
        console.error('Failed to fetch count:', error);
        setTotalCount(passwords.length); // fallback to local count
      }
    };
    fetchCount();
  }, [passwords.length]);
  const calculateWeakPasswords = () => {
    return passwords.filter(p => p.password.length < 12).length;
  };

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {
      Social: 0,
      Work: 0,
      Finance: 0,
      Entertainment: 0,
      Shopping: 0,
      Other: 0,
    };
    passwords.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      } else {
        counts['Other']++;
      }
    });
    return counts;
  };

  const calculateSecurityScore = () => {
    if (passwords.length === 0) return 100;
    const weakCount = calculateWeakPasswords();
    const score = Math.max(0, 100 - (weakCount / passwords.length) * 100);
    return Math.round(score);
  };

  const categoryCounts = getCategoryCounts();
  const weakPasswords = calculateWeakPasswords();
  const securityScore = calculateSecurityScore();
  const totalCategories = Object.values(categoryCounts).filter(count => count > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2>Панель безопасности</h2>
        <p className="text-muted-foreground">Обзор безопасности ваших паролей</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Всего паролей</p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="mb-1">{totalCount}</h1>
            <p className="text-muted-foreground">Надёжно хранятся в вашем хранилище</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Слабые пароли</p>
            </div>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div>
            <h1 className="mb-1" style={{ color: weakPasswords > 0 ? '#ca8a04' : 'inherit' }}>
              {weakPasswords}
            </h1>
            <p className="text-muted-foreground">Нужно усилить</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Категории</p>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <FolderOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <h1 className="mb-1">{totalCategories}</h1>
            <p className="text-muted-foreground">Различных типов аккаунтов</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-muted-foreground mb-1">Оценка безопасности</p>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <h1 className="mb-1" style={{ color: '#16a34a' }}>{securityScore}%</h1>
            <p className="text-muted-foreground">На основе силы паролей</p>
          </div>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="p-6">
        <h3 className="mb-4">Распределение по категориям</h3>
        <div className="space-y-3">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-muted-foreground">{category}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Demo Notice */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="ml-3">
          <h4 className="mb-1" style={{ color: '#2563eb' }}>Demo Version Notice</h4>
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            This is a demonstration password manager. Your data is stored locally in your browser and may be lost when you clear your browser data.
            <br />
            For production use, consider connecting to a secure database for persistent storage.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}
