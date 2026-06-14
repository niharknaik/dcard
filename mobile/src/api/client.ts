import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import Config from 'react-native-config';
import {tokenStorage} from '@/utils/storage';

const baseURL = Config.API_BASE_URL ?? 'http://10.0.2.2:8000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  headers: {Accept: 'application/json'},
});

// Callback wired up by the auth store to force a logout on hard 401s.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {_retry?: boolean};
    const status = error.response?.status;
    const isAuthRoute = original?.url?.includes('/auth/');

    // Try a single token refresh on 401, then replay the original request.
    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const {data} = await axios.post(
            `${baseURL}/auth/refresh`,
            {},
            {headers: {Authorization: `Bearer ${await tokenStorage.get()}`}},
          );
          await tokenStorage.set(data.data.token);
          isRefreshing = false;
        }
        const token = await tokenStorage.get();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        isRefreshing = false;
        await tokenStorage.clear();
        onUnauthorized?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/** Normalize an Axios error into a user-facing message. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {message?: string; errors?: Record<string, string[]>} | undefined;
    if (data?.errors) {
      const first = Object.values(data.errors)[0];
      if (first?.[0]) {
        return first[0];
      }
    }
    return data?.message ?? error.message;
  }
  return 'Something went wrong. Please try again.';
}
