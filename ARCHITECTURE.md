# SecureVault Frontend Architecture

This project follows a hybrid of MVVM (Model-View-ViewModel) and Feature-Sliced Design (FSD).
The structure is intentionally layered to keep security-sensitive logic isolated and testable,
while UI components remain presentational.

## MVVM Mapping

- Model
  - `shared/api/` network client and transport helpers
  - `shared/lib/crypto/` cryptography primitives and helpers
  - `entities/` domain types and key management
- ViewModel
  - `features/**/model/` hooks that orchestrate state and business rules
  - `features/authentication/model/AuthContext.tsx` global auth state
  - `entities/encryption-key/model/VaultCryptoContext.tsx` vault key lifecycle
- View
  - `pages/**/ui/` route-level pages
  - `features/**/ui/` interactive feature UIs
  - `widgets/**/ui/` shared layout widgets

## FSD Layers (Actual Structure)

- `app/`
  - `router/` route config and auth guard
  - `layout/` global layout and footer
  - `providers/` app-level providers (router, auth, vault crypto, toaster)
  - `config/` security constants and API base URL
- `pages/`
  - `home/` landing page
  - `auth/` login/register page
  - `vault/` vault entry point
- `features/`
  - `authentication/` auth state and login flow
  - `password-vault/` vault UI and CRUD interactions
  - `password-generator/` password generation UI
  - `security-analytics/` dashboard analytics
  - `category-management/` category CRUD
- `entities/`
  - `password/` password domain types
  - `encryption-key/` vault key lifecycle
- `shared/`
  - `api/` HTTP client and helpers
  - `lib/crypto/` AES-GCM, KDF, base64, DEK wrap/unwrap
  - `ui/` design system components (shadcn/ui)
- `widgets/`
  - `navigation/` header navigation widget

## Core Flows

### Auth Flow
1. `AuthProvider` checks session via `/auth/check`.
2. `AuthPage` submits credentials via `/auth/login` or `/auth/register`.
3. On success, auth state updates and router redirects to `/app`.

### Vault Access Flow
1. User opens Vault view in `VaultView`.
2. `VaultGate` requests `/vault/entries/meta`.
3. If access is false, user sets a master password and the client:
   - derives KEK via Argon2id
   - generates DEK
   - encrypts DEK (AES-GCM)
   - posts meta to `/vault/entries/meta`
4. If access is true, user unlocks with master password:
   - derives KEK
   - decrypts DEK (AES-GCM)
5. DEK stays only in memory until logout/lock.

### Password Management Flow
1. `usePasswordManager` loads entries only when vault is unlocked.
2. Entries are decrypted client-side using DEK.
3. Create/update encrypts only `password` as `passwordCipher + passwordIv`.
4. Delete removes entry by id.

### Security Analytics Flow
1. `useSecurityAnalytics` computes weak password stats and score.
2. `useCategoryManager` handles category CRUD.
3. `Dashboard` renders stats and management UI.

## State Layers

- Global
  - Auth session (`AuthProvider`)
  - Vault DEK and access (`VaultCryptoProvider`)
- Feature
  - Password manager state (`usePasswordManager`)
  - Category state (`useCategoryManager`)
  - Analytics state (`useSecurityAnalytics`)
- Local UI
  - Form input, dialog open/close, transient UI state in views

## Security Principles

- Master password never leaves the client.
- DEK is stored only in memory and cleared on logout.
- Only password data is encrypted; metadata remains plaintext by design.

## Notes

- API base URL is centralized in `app/config/api.ts`.
- Crypto parameters live in `app/config/crypto.ts`.
- Route guard logic lives in `app/router/RequireAuth.tsx`.
