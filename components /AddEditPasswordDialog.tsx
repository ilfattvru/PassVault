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
    category: 'Other',
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
        category: 'Other',
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
            <DialogTitle>Add Password Entry</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Gmail, Facebook"
                required
              />
            </div>

            <div>
              <Label htmlFor="url">Website</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="e.g., gmail.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username/Email *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Your secure password"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about this account"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Save Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Password Generator Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="mb-4">Password Generator</h3>
          <PasswordGenerator onUsePassword={handleUseGeneratedPassword} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
