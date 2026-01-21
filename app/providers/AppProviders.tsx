import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { VaultCryptoProvider } from '@/entities/encryption-key/model/VaultCryptoContext';
import { AuthProvider } from '@/features/authentication/model/AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <VaultCryptoProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          {children}
        </BrowserRouter>
      </AuthProvider>
    </VaultCryptoProvider>
  );
}
