import { Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/features/authentication/model/AuthContext';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, canManageAccess, logout } = useAuth();
  const isAppPage = location.pathname.startsWith('/app');
  const isLoginPage = location.pathname.startsWith('/login');

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(isAuthenticated ? '/app' : '/')}
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

          <nav className="flex items-center gap-2 flex-wrap justify-end">
            {!isAppPage && !isLoginPage && (
              <>
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  onClick={() => navigate('/')}
                >
                  Главная
                </Button>
                <Button onClick={() => navigate('/login')}>Войти</Button>
              </>
            )}
            {isAppPage && isAuthenticated && (
              <>
                <Button
                  variant={location.pathname === '/app' ? 'default' : 'ghost'}
                  onClick={() => navigate('/app')}
                >
                  Хранилище
                </Button>
                {canManageAccess && (
                  <Button
                    variant={location.pathname === '/app/management' ? 'default' : 'ghost'}
                    onClick={() => navigate('/app/management')}
                  >
                    Управление доступом
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Выйти
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
