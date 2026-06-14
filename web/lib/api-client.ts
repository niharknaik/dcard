import {clearToken, getToken} from './auth';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Authenticated JSON fetch against the DCard API. Attaches the JWT, unwraps the
 * `{ data }` envelope, and on a 401 clears the token and bounces to /login.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError('Unauthorized', 401);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Something went wrong.', res.status);
  }

  return json?.data as T;
}

/**
 * Multipart upload (e.g. images). PHP can't parse multipart on PUT, so callers
 * targeting a PUT route should add `_method=PUT` to the FormData and POST here.
 * Content-Type is intentionally left unset so the browser adds the boundary.
 */
export async function apiUpload<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    method,
    body: formData,
    headers: {
      Accept: 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError('Unauthorized', 401);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Upload failed.', res.status);
  }

  return json?.data as T;
}
