import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useVaultCrypto } from './crypto/VaultCryptoContext';

type VaultGateMode = 'checking' | 'setup' | 'unlock' | 'error';

type VaultGateProps = {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
};

export function VaultGate({ open, onClose, onUnlocked }: VaultGateProps) {
  const { ensureVaultAccess, setupMasterPassword, unlockVault } = useVaultCrypto();
  const [mode, setMode] = useState<VaultGateMode>('checking');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runMetaCheck = useCallback(() => {
    let isActive = true;
    const checkMeta = async () => {
      setMode('checking');
      setErrorMessage('');
      setMasterPassword('');
      setConfirmPassword('');
      try {
        const result = await ensureVaultAccess();
        if (!isActive) return;
        setMode(result.hasMasterPassword ? 'unlock' : 'setup');
      } catch (error) {
        if (!isActive) return;
        setMode('error');
        setErrorMessage('Не удалось проверить состояние хранилища.');
      }
    };
    checkMeta();
    return () => {
      isActive = false;
    };
  }, [ensureVaultAccess]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const cleanup = runMetaCheck();
    return cleanup;
  }, [open, runMetaCheck]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    if (!masterPassword) {
      setErrorMessage('Введите мастер-пароль.');
      return;
    }

    if (mode === 'setup' && masterPassword !== confirmPassword) {
      setErrorMessage('Пароли не совпадают.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'setup') {
        await setupMasterPassword(masterPassword);
      } else {
        await unlockVault(masterPassword);
      }
      onUnlocked();
    } catch (error) {
      if (mode === 'unlock' && error instanceof Error && error.message === 'invalid_master_password') {
        setErrorMessage('Неверный мастер-пароль.');
      } else {
        setErrorMessage('Не удалось открыть хранилище.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === 'setup' ? 'Создайте мастер-пароль' : 'Разблокируйте хранилище'}
          </CardTitle>
          <CardDescription>
            {mode === 'setup'
              ? 'Мастер-пароль защищает доступ к вашим паролям.'
              : 'Введите мастер-пароль, чтобы получить доступ к хранилищу.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'checking' && (
            <p className="text-muted-foreground">Проверяем состояние хранилища...</p>
          )}
          {mode === 'error' && (
            <p className="text-destructive">{errorMessage || 'Ошибка загрузки.'}</p>
          )}
          {mode !== 'checking' && mode !== 'error' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm" htmlFor="master-password">
                  Мастер-пароль
                </label>
                <Input
                  id="master-password"
                  type="password"
                  value={masterPassword}
                  onChange={(event) => setMasterPassword(event.target.value)}
                  autoFocus
                  required
                />
              </div>
              {mode === 'setup' && (
                <div className="space-y-2">
                  <label className="text-sm" htmlFor="confirm-master-password">
                    Подтвердите мастер-пароль
                  </label>
                  <Input
                    id="confirm-master-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              )}
              {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Подождите...' : 'Продолжить'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Назад
          </Button>
          {mode === 'error' && (
            <Button onClick={runMetaCheck} disabled={isSubmitting}>
              Повторить
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
