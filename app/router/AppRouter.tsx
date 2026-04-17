import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { HomePage } from '@/pages/home/ui/HomePage';
import { AuthPage } from '@/pages/auth/ui/AuthPage';
import { VaultPage } from '@/pages/vault/ui/VaultPage';
import { ManagementPage } from '@/pages/management/ui/ManagementPage';
import { RequireAuth } from './RequireAuth';
import { RequireManageAccess } from './RequireManageAccess';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <VaultPage />
            </RequireAuth>
          }
        />
        <Route
          path="/app/management"
          element={
            <RequireAuth>
              <RequireManageAccess>
                <ManagementPage />
              </RequireManageAccess>
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
