import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navigation } from '@/widgets/navigation/ui/Navigation';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAppRoute = location.pathname.startsWith('/app');
  const isAuthRoute = location.pathname.startsWith('/login');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Outlet />

      {!isAppRoute && !isAuthRoute && (
        <footer className="border-t py-12 px-6 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="mb-4">SecureVault</h3>
                <p className="text-muted-foreground">
                  Самый надежный менеджер паролей для частных лиц и бизнеса.
                </p>
              </div>
              <div>
                <h4 className="mb-4">Продукт</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <button onClick={() => navigate('/login')} className="hover:text-foreground">
                      Попробовать
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/')} className="hover:text-foreground">
                      Главная
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4">Правовая информация</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <a href="#" className="hover:text-foreground">
                      Политика конфиденциальности
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground">
                      Условия использования
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-foreground">
                      Безопасность
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
              <p>© 2025 SecureVault. Все права защищены.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
