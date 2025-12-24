import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { VaultApp } from './components/VaultApp';
import { Toaster } from 'sonner';

type Page = 'home' | 'login' | 'app';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8080/vault/entries/all', {
          credentials: 'include',
        });
        if (response.status === 200) {
          setIsAuthenticated(true);
          setCurrentPage('app');
        }
      } catch (error) {
        console.log('Not authenticated');
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('app');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (currentPage === 'app' && !isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'app':
        return <VaultApp />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      
      {/* Footer */}
      {currentPage !== 'app' && currentPage !== 'login' && (
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
                    <button onClick={() => setCurrentPage('login')} className="hover:text-foreground">
                      Попробовать
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentPage('home')} className="hover:text-foreground">
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
