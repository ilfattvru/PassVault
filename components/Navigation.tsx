import { Shield } from 'lucide-react';
import { Button } from './ui/button';

type Page = 'home' | 'login' | 'app';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout?: () => void;
}

export function Navigation({ currentPage, onNavigate, onLogout }: NavigationProps) {
  const isAppPage = currentPage === 'app';

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-foreground text-background rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2>SecureVault</h2>
              <p className="text-muted-foreground">Менеджер паролей</p>
            </div>
          </button>

          <nav className="flex items-center gap-2">
            {!isAppPage && currentPage !== 'login' && (
              <>
                <Button
                  variant={currentPage === 'home' ? 'default' : 'ghost'}
                  onClick={() => onNavigate('home')}
                >
                  Главная
                </Button>
                <Button onClick={() => onNavigate('login')}>
                  Войти
                </Button>
              </>
            )}
            {isAppPage && (
              <Button variant="ghost" onClick={onLogout ?? (() => onNavigate('home'))}>
                Выйти
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
