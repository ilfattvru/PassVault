import { useState, useEffect } from 'react';
import { Plus, Search, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PasswordItem, type Password } from './PasswordItem';
import { AddEditPasswordDialog } from './AddEditPasswordDialog';
import { Dashboard } from './Dashboard';
import { ThemeToggle } from './ThemeToggle';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function VaultApp() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [allPasswords, setAllPasswords] = useState<Password[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentView, setCurrentView] = useState<'dashboard' | 'vault'>('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const checkAuthAndRedirect = (response: Response) => {
    if (response.status === 403) {
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  // Load all passwords once on mount
  useEffect(() => {
    const loadAllPasswords = async () => {
      try {
        const response = await fetch('http://localhost:8080/vault/entries/all', {
          credentials: 'include',
        });
        if (checkAuthAndRedirect(response)) return;
        if (response.status === 200) {
          const data = await response.json();
          const formattedPasswords = data.map((item: any) => ({
            id: item.id.toString(), // Используем ID от бекенда
            title: item.title,
            username: item.email,
            password: item.data,
            url: item.website,
            category: item.categoryName,
            notes: '',
            createdAt: Date.now(),
          }));
          setAllPasswords(formattedPasswords);
          setPasswords(formattedPasswords);
        }
      } catch (error) {
        console.error('Failed to load passwords:', error);
      }
    };
    loadAllPasswords();
  }, []);

  // Filter passwords by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setPasswords(allPasswords);
    } else {
      const loadCategoryPasswords = async () => {
        try {
          const url = `http://localhost:8080/vault/entries?categoryName=${encodeURIComponent(getCategoryNameInRussian(selectedCategory))}`;
          
          const response = await fetch(url, {
            credentials: 'include',
          });
          if (checkAuthAndRedirect(response)) return;
          if (response.status === 200) {
            const data = await response.json();
            const formattedPasswords = data.map((item: any) => ({
              id: item.id.toString(), // Используем ID от бекенда
              title: item.title,
              username: item.email,
              password: item.data,
              url: item.website,
              category: item.categoryName,
              notes: '',
              createdAt: Date.now(),
            }));
            setPasswords(formattedPasswords);
          }
        } catch (error) {
          console.error('Failed to load passwords:', error);
        }
      };
      
      if (allPasswords.length > 0) {
        loadCategoryPasswords();
      }
    }
  }, [selectedCategory, allPasswords]);

  const getCategoryNameInRussian = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'Social': 'Социальные сети',
      'Work': 'Работа',
      'Finance': 'Финансы',
      'Entertainment': 'Развлечения',
      'Shopping': 'Покупки',
      'Other': 'Другое'
    };
    return categoryMap[category] || category;
  };

  const handleSavePassword = async (passwordData: Omit<Password, 'id' | 'createdAt'>) => {
    if (editingPassword) {
      // Update existing password via backend
      try {
        const response = await fetch(`http://localhost:8080/vault/entries/update/${editingPassword.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            id: editingPassword.id,
            title: passwordData.title,
            website: passwordData.url || '',
            email: passwordData.username,
            categoryName: passwordData.category,
            data: passwordData.password,
          }),
        });

        if (checkAuthAndRedirect(response)) return;
        if (response.status === 200) {
          setPasswords(
            passwords.map((p) =>
              p.id === editingPassword.id
                ? { ...passwordData, id: p.id, createdAt: p.createdAt }
                : p
            )
          );
          toast.success('Пароль обновлен успешно');
        } else {
          toast.error('Не удалось обновить пароль');
        }
      } catch (error) {
        toast.error('Ошибка подключения к серверу');
      }
      setEditingPassword(null);
    } else {
      // Add new password via backend
      try {
        const response = await fetch('http://localhost:8080/vault/entries/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: passwordData.title,
            website: passwordData.url || '',
            email: passwordData.username,
            categoryName: passwordData.category,
            data: passwordData.password,
          }),
        });

        if (checkAuthAndRedirect(response)) return;
        if (response.status === 200) {
          const newPassword: Password = {
            ...passwordData,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
          };
          setPasswords([newPassword, ...passwords]);
          toast.success('Пароль сохранен успешно');
        } else {
          toast.error('Не удалось сохранить пароль');
        }
      } catch (error) {
        toast.error('Ошибка подключения к серверу');
      }
    }
  };

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password);
    setDialogOpen(true);
  };

  const handleDeletePassword = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const response = await fetch(`http://localhost:8080/vault/entries/${deleteId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (checkAuthAndRedirect(response)) return;
        if (response.status === 200) {
          setPasswords(passwords.filter((p) => p.id !== deleteId));
          toast.success('Пароль удален успешно');
        } else {
          toast.error('Не удалось удалить пароль');
        }
        
      } catch(error) {
        toast.error('Ошибка подключения к серверу');
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleAddNew = () => {
    setEditingPassword(null);
    setDialogOpen(true);
  };

  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      password.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (password.url && password.url.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'All') return allPasswords.length;
    return allPasswords.filter((p) => p.category === category).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('dashboard')}
              >
                Панель управления
              </Button>
              <Button
                variant={currentView === 'vault' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('vault')}
              >
                Хранилище
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {currentView === 'dashboard' ? (
          <Dashboard passwords={passwords} />
        ) : (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Поиск паролей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Все {getCategoryCount('All')}</SelectItem>
                  <SelectItem value="Social">Социальные сети {getCategoryCount("Социальные сети")}</SelectItem>
                  <SelectItem value="Work">Работа {getCategoryCount('Работа')}</SelectItem>
                  <SelectItem value="Finance">Финансы {getCategoryCount('Финансы')}</SelectItem>
                  <SelectItem value="Entertainment">
                    Развлечения {getCategoryCount('Развлечения')}
                  </SelectItem>
                  <SelectItem value="Shopping">Покупки {getCategoryCount('Покупки')}</SelectItem>
                  <SelectItem value="Other">Другое {getCategoryCount('Другое')}</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить пароль
              </Button>
            </div>

            {/* Password Count */}
            <p className="text-muted-foreground">
              {filteredPasswords.length} из {passwords.length} паролей
            </p>

            {/* Password List */}
            {filteredPasswords.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2">Пароли не найдены</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Попробуйте изменить параметры поиска или фильтры'
                    : 'Начните с добавления вашего первого пароля'}
                </p>
                {!searchQuery && selectedCategory === 'All' && (
                  <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить первый пароль
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPasswords.map((password) => (
                  <PasswordItem
                    key={password.id}
                    password={password}
                    onEdit={handleEditPassword}
                    onDelete={handleDeletePassword}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Help Button */}
      <button
        className="fixed bottom-6 right-6 p-4 bg-foreground text-background rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Помощь"
        onClick={() => toast.info('Нужна помощь? Свяжитесь с нами: support@securevault.com')}
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Add/Edit Dialog */}
      <AddEditPasswordDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingPassword(null);
        }}
        onSave={handleSavePassword}
        editPassword={editingPassword}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие невозможно отменить. Пароль будет окончательно удален из вашего хранилища.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}