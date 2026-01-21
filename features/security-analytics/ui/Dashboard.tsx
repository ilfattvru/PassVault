import { Card } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Key, AlertTriangle, FolderOpen, TrendingUp, Shield } from 'lucide-react';
import type { Password } from '@/entities/password/model/types';
import { useSecurityAnalytics } from '@/features/security-analytics/model/useSecurityAnalytics';
import { useCategoryManager } from '@/features/category-management/model/useCategoryManager';

interface DashboardProps {
  passwords: Password[];
  onCategoriesChanged?: () => void;
}

export function Dashboard({ passwords, onCategoriesChanged }: DashboardProps) {
  const {
    totalCount,
    categoryCounts,
    weakPasswords,
    securityScore,
    totalCategories,
  } = useSecurityAnalytics(passwords);

  const {
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
  } = useCategoryManager({
    initialCategories: Object.keys(categoryCounts),
    onChange: onCategoriesChanged,
  });

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
          {categories.map((category) => (
            <div key={category} className="flex items-center justify-between gap-3">
              {editingCategory === category ? (
                <div className="flex w-full flex-1 flex-col gap-2">
                  <Input
                    value={updatedCategory}
                    onChange={(event) => setUpdatedCategory(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateCategory}>
                      Сохранить
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-muted-foreground">{category}</span>
                  <div className="flex items-center gap-2">
                    <span>{categoryCounts[category] ?? 0}</span>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(category)}>
                      Изменить
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      Удалить
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-muted-foreground">Категории не найдены.</p>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Новая категория"
          />
          <Button onClick={handleAddCategory}>Добавить</Button>
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
