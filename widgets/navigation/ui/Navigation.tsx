import { Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/features/authentication/model/AuthContext';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const isAppPage = location.pathname.startsWith('/app');
  const isLoginPage = location.pathname.startsWith('/login');

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
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
            {!isAppPage && !isLoginPage && (
              <>
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  onClick={() => navigate('/')}
                >
                  Главная
                </Button>
                <Button onClick={() => navigate('/login')}>
                  Войти
                </Button>
              </>
            )}
            {isAppPage && isAuthenticated && (
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Выйти
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
