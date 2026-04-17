import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/authentication/model/AuthContext';

export function RequireManageAccess({ children }: { children: React.ReactNode }) {
  const { canManageAccess, isLoading } = useAuth();

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

  if (!canManageAccess) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
