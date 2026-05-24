import axios from 'axios';
import { useAuth } from '@clerk/expo';
import { useMemo } from 'react';

// Use local machine IP for android emulator, e.g. 10.0.2.2 or real IP
const rawUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const API_BASE_URL = rawUrl.endsWith('/api/v1') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api/v1`;

export const useApiClient = () => {
  const { getToken, isLoaded } = useAuth();

  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 25000, // 25s — handles Render free-tier cold starts (can take 30-50s)
    });

    client.interceptors.request.use(async (config: any) => {
      try {
        // Wait briefly for Clerk to be ready before attaching token
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Error getting auth token:', error);
      }
      return config;
    });

    // Log errors in dev to help diagnose data issues
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (__DEV__) {
          console.warn(
            '[API Error]',
            error?.config?.url,
            error?.response?.status ?? error?.code,
            error?.message,
          );
        }
        return Promise.reject(error);
      },
    );

    return client;
  }, [getToken]);

  return apiClient;
};
