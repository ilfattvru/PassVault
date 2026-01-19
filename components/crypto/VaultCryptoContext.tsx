import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { deriveKEK, type KdfParams } from '../../crypto/kdf';
import { fromBase64, toBase64 } from '../../crypto/base64';
import { unwrapDEK, wrapDEK } from '../../crypto/dek';

export type VaultMeta = {
  access: boolean;
  cryptoSalt?: string;
  cryptoKdfParams?: KdfParams;
  encryptedDEK?: string;
  encryptedDEK_iv?: string;
};

type VaultAccessResult = {
  hasMasterPassword: boolean;
  meta: VaultMeta;
};

type VaultCryptoContextValue = {
  dek: Uint8Array | null;
  isUnlocked: boolean;
  ensureVaultAccess: () => Promise<VaultAccessResult>;
  setupMasterPassword: (masterPassword: string) => Promise<void>;
  unlockVault: (masterPassword: string) => Promise<void>;
  lockVault: () => void;
};

const DEFAULT_KDF_PARAMS: KdfParams = {
  memory: 65536,
  iterations: 3,
  parallelism: 1,
};

const VaultCryptoContext = createContext<VaultCryptoContextValue | undefined>(undefined);

const checkAuthAndRedirect = (response: Response) => {
  if (response.status === 403) {
    window.location.href = '/login';
    return true;
  }
  return false;
};

export function VaultCryptoProvider({ children }: { children: React.ReactNode }) {
  const [dek, setDek] = useState<Uint8Array | null>(null);

  const ensureVaultAccess = useCallback(async () => {
    const response = await fetch('http://localhost:8080/vault/entries/meta', {
      credentials: 'include',
    });
    if (checkAuthAndRedirect(response)) {
      throw new Error('unauthorized');
    }
    if (response.status !== 200) {
      throw new Error('vault_meta_fetch_failed');
    }
    const data = (await response.json()) as VaultMeta;
    return { hasMasterPassword: !!data.access, meta: data };
  }, []);

  const setupMasterPassword = useCallback(
    async (masterPassword: string) => {
      const cryptoSalt = crypto.getRandomValues(new Uint8Array(16));
      const kek = await deriveKEK(masterPassword, cryptoSalt, DEFAULT_KDF_PARAMS);
      const dekBytes = crypto.getRandomValues(new Uint8Array(32));
      const { cipherBytes, iv } = await wrapDEK(dekBytes, kek);

      const response = await fetch('http://localhost:8080/vault/entries/meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          access: true,
          cryptoSalt: toBase64(cryptoSalt),
          cryptoKdfParams: DEFAULT_KDF_PARAMS,
          encryptedDEK: toBase64(cipherBytes),
          encryptedDEK_iv: toBase64(iv),
        }),
      });

      if (checkAuthAndRedirect(response)) {
        throw new Error('unauthorized');
      }
      if (response.status !== 200) {
        throw new Error('vault_meta_save_failed');
      }

      setDek(dekBytes);
    },
    [],
  );

  const unlockVault = useCallback(
    async (masterPassword: string) => {
      const { meta } = await ensureVaultAccess();
      if (!meta.access || !meta.cryptoSalt || !meta.cryptoKdfParams) {
        throw new Error('vault_meta_missing');
      }
      if (!meta.encryptedDEK || !meta.encryptedDEK_iv) {
        throw new Error('vault_meta_missing');
      }

      const saltBytes = fromBase64(meta.cryptoSalt);
      const kek = await deriveKEK(masterPassword, saltBytes, meta.cryptoKdfParams);
      const encryptedDekBytes = fromBase64(meta.encryptedDEK);
      const ivBytes = fromBase64(meta.encryptedDEK_iv);

      try {
        const dekBytes = await unwrapDEK(encryptedDekBytes, ivBytes, kek);
        setDek(dekBytes);
      } catch (error) {
        throw new Error('invalid_master_password');
      }
    },
    [ensureVaultAccess],
  );

  const lockVault = useCallback(() => {
    setDek(null);
  }, []);

  const value = useMemo(
    () => ({
      dek,
      isUnlocked: dek !== null,
      ensureVaultAccess,
      setupMasterPassword,
      unlockVault,
      lockVault,
    }),
    [dek, ensureVaultAccess, setupMasterPassword, unlockVault, lockVault],
  );

  return <VaultCryptoContext.Provider value={value}>{children}</VaultCryptoContext.Provider>;
}

export const useVaultCrypto = () => {
  const context = useContext(VaultCryptoContext);
  if (!context) {
    throw new Error('useVaultCrypto must be used within VaultCryptoProvider');
  }
  return context;
};
