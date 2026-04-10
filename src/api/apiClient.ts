import axios from 'axios';
import { useAuth } from '@clerk/expo';
import { useMemo } from 'react';

// Use local machine IP for android emulator, e.g. 10.0.2.2 or real IP
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const useApiClient = () => {
  const { getToken } = useAuth();

  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
    });

    client.interceptors.request.use(async (config: any) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Error getting auth token:', error);
      }
      return config;
    });

    return client;
  }, [getToken]);

  return apiClient;
};
