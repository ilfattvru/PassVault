import { useState } from 'react';
import { Plus, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PasswordItem } from '@/features/password-vault/ui/PasswordItem';
import type { Password } from '@/entities/password/model/types';
import { AddEditPasswordDialog } from '@/features/password-vault/ui/AddEditPasswordDialog';
import { Dashboard } from '@/features/security-analytics/ui/Dashboard';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { toast } from 'sonner';
import { VaultGate } from '@/features/password-vault/ui/VaultGate';
import { useVaultCrypto } from '@/entities/encryption-key/model/VaultCryptoContext';
import { usePasswordManager } from '@/features/password-vault/model/usePasswordManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

// Flow: Auth -> Dashboard -> Click Vault -> GET meta -> (setup/unlock) -> DEK in memory -> load entries -> decrypt data.
export function VaultView() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'vault'>('dashboard');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [vaultGateOpen, setVaultGateOpen] = useState(false);
  const { dek, isUnlocked } = useVaultCrypto();
  const {
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
  } = usePasswordManager({
    dek,
    isUnlocked,
    isActive: currentView === 'vault',
  });

  const handleSavePassword = async (passwordData: Omit<Password, 'id' | 'createdAt'>) => {
    const success = await savePassword(passwordData, editingPassword?.id);
    if (success) {
      setEditingPassword(null);
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
    if (!deleteId) return;
    try {
      await deletePassword(deleteId);
    } finally {
      setDeleteId(null);
    }
  };

  const handleAddNew = () => {
    setEditingPassword(null);
    setDialogOpen(true);
  };

  const handleVaultNavigation = () => {
    if (isUnlocked) {
      setCurrentView('vault');
      return;
    }
    setVaultGateOpen(true);
  };

  const handleCategoriesChanged = () => {
    loadAllPasswords();
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
                onClick={handleVaultNavigation}
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
          <Dashboard
            passwords={allPasswords}
            onCategoriesChanged={handleCategoriesChanged}
          />
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

      <VaultGate
        open={vaultGateOpen}
        onClose={() => setVaultGateOpen(false)}
        onUnlocked={() => {
          setVaultGateOpen(false);
          setCurrentView('vault');
        }}
      />
    </div>
  );
}
