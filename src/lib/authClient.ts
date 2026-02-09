import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/lib/apiBase";
import { clearStoredUser } from "@/lib/authStorage";
import { useStore } from "@/store/useStore";

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function refreshAccessToken(): Promise<string> {
  const response = await authClient.post<RefreshResponse>("/auth/refresh");
  return response.data.access_token;
}

export async function logoutSession(): Promise<void> {
  await authClient.post("/auth/logout");
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const shouldSkipRefresh = (url?: string) => {
  if (!url) return false;
  return url.includes("/auth/refresh") || url.includes("/auth/logout") || url.includes("/oauth/");
};

let refreshPromise: Promise<string | null> | null = null;

const setAccessToken = (token: string | null) => useStore.getState().setAccessToken(token);
const clearUser = () => useStore.getState().setUser(null);

const refreshTokenOnce = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((token) => {
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        clearUser();
        clearStoredUser();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

authClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const responseStatus = error.response?.status;
    const originalConfig = error.config as RetriableRequestConfig | undefined;

    if (
      responseStatus === 401 &&
      originalConfig &&
      !originalConfig._retry &&
      !shouldSkipRefresh(originalConfig.url)
    ) {
      originalConfig._retry = true;
      const newToken = await refreshTokenOnce();
      if (newToken) {
        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return authClient(originalConfig);
      }
    }

    return Promise.reject(error);
  }
);
