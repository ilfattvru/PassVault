import { useState } from 'react';
import { Eye, EyeOff, Copy, Pencil, Trash2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { Password } from '@/entities/password/model/types';

interface PasswordItemProps {
  password: Password;
  onEdit: (password: Password) => void;
  onDelete: (id: string) => void;
}

export function PasswordItem({ password, onEdit, onDelete }: PasswordItemProps) {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Social': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Work': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Finance': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Shopping': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[category] || colors['Other'];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header with title and badge */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg mt-1">
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="mb-1 truncate">{password.title}</h3>
            <Badge className={getCategoryColor(password.category)} variant="secondary">
              {password.category}
            </Badge>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Username</p>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate">{password.username}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(password.username, 'Username')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <p className="text-muted-foreground">Password</p>
          <div className="flex items-center gap-2">
            <span className="flex-1 font-mono">
              {showPassword ? password.password : '••••••••'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => copyToClipboard(password.password, 'Password')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer with date and actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-muted-foreground">Updated {formatDate(password.createdAt)}</p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(password)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(password.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
