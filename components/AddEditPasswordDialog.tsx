import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PasswordGenerator } from './PasswordGenerator';
import type { Password } from './PasswordItem';
import { X } from 'lucide-react';

interface AddEditPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (password: Omit<Password, 'id' | 'createdAt'>) => void;
  editPassword?: Password | null;
}

export function AddEditPasswordDialog({
  open,
  onOpenChange,
  onSave,
  editPassword,
}: AddEditPasswordDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    category: 'Другое',
    notes: '',
  });

  useEffect(() => {
    if (editPassword) {
      setFormData({
        title: editPassword.title,
        username: editPassword.username,
        password: editPassword.password,
        url: editPassword.url || '',
        category: editPassword.category,
        notes: editPassword.notes || '',
      });
    } else {
      setFormData({
        title: '',
        username: '',
        password: '',
        url: '',
        category: 'Другое',
        notes: '',
      });
    }
  }, [editPassword, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleUseGeneratedPassword = (password: string) => {
    setFormData({ ...formData, password });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Добавить пароль</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="напр., Gmail, Facebook"
                required
              />
            </div>

            <div>
              <Label htmlFor="url">Сайт</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="напр., gmail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Логин/Email *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Социальные сети">Социальные сети</SelectItem>
                  <SelectItem value="Работа">Работа</SelectItem>
                  <SelectItem value="Финансы">Финансы</SelectItem>
                  <SelectItem value="Развлечения">Развлечения</SelectItem>
                  <SelectItem value="Покупки">Покупки</SelectItem>
                  <SelectItem value="Другое">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="password">Пароль *</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Ваш надёжный пароль"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Дополнительные заметки об этом аккаунте"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Сохранить пароль
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
          </div>
        </form>

        {/* Password Generator Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="mb-4">Генератор паролей</h3>
          <PasswordGenerator onUsePassword={handleUseGeneratedPassword} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
