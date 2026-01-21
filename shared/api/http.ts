import { API_BASE_URL } from '@/app/config/api';

type ApiFetchOptions = RequestInit;

export const apiFetch = (path: string, options: ApiFetchOptions = {}) => {
  const fetchOptions = options;
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...fetchOptions,
  });
};

export const isAuthForbidden = (response: Response) => response.status === 403;
