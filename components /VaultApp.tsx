import { useState, useEffect } from 'react';
import { Plus, Search, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PasswordItem, type Password } from './PasswordItem';
import { AddEditPasswordDialog } from './AddEditPasswordDialog';
import { Dashboard } from './Dashboard';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentView, setCurrentView] = useState<'dashboard' | 'vault'>('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load passwords from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('passwords');
    if (stored) {
      try {
        setPasswords(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load passwords:', e);
      }
    }
  }, []);

  // Save passwords to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('passwords', JSON.stringify(passwords));
  }, [passwords]);

  const handleSavePassword = (passwordData: Omit<Password, 'id' | 'createdAt'>) => {
    if (editingPassword) {
      // Update existing password
      setPasswords(
        passwords.map((p) =>
          p.id === editingPassword.id
            ? { ...passwordData, id: p.id, createdAt: p.createdAt }
            : p
        )
      );
      toast.success('Password updated successfully');
      setEditingPassword(null);
    } else {
      // Add new password
      const newPassword: Password = {
        ...passwordData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setPasswords([newPassword, ...passwords]);
      toast.success('Password saved successfully');
    }
  };

  const handleEditPassword = (password: Password) => {
    setEditingPassword(password);
    setDialogOpen(true);
  };

  const handleDeletePassword = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setPasswords(passwords.filter((p) => p.id !== deleteId));
      toast.success('Password deleted successfully');
      setDeleteId(null);
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

    const matchesCategory =
      selectedCategory === 'All' || password.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryCount = (category: string) => {
    if (category === 'All') return passwords.length;
    return passwords.filter((p) => p.category === category).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex gap-2 justify-center">
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
                  <SelectItem value="Social">Соцсети {getCategoryCount('Social')}</SelectItem>
                  <SelectItem value="Work">Работа {getCategoryCount('Work')}</SelectItem>
                  <SelectItem value="Finance">Финансы {getCategoryCount('Finance')}</SelectItem>
                  <SelectItem value="Entertainment">
                    Развлечения {getCategoryCount('Entertainment')}
                  </SelectItem>
                  <SelectItem value="Shopping">Покупки {getCategoryCount('Shopping')}</SelectItem>
                  <SelectItem value="Other">Другое {getCategoryCount('Other')}</SelectItem>
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