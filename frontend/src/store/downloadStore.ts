import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DownloadItem, DownloadStatus } from '@/types';

interface DownloadStore {
  downloads: DownloadItem[];
  addDownload: (item: Omit<DownloadItem, 'id' | 'status' | 'progress'>) => void;
  updateProgress: (messageId: string, progress: number) => void;
  setStatus: (messageId: string, status: DownloadStatus, localUri?: string, sizeBytes?: number) => void;
  removeDownload: (messageId: string) => void;
  isDownloaded: (messageId: string) => boolean;
  getDownload: (messageId: string) => DownloadItem | undefined;
}

export const useDownloadStore = create<DownloadStore>()(
  persist(
    (set, get) => ({
      downloads: [],

      addDownload: (item) =>
        set((state) => ({
          downloads: [
            ...state.downloads,
            {
              ...item,
              id: `dl_${Date.now()}`,
              status: 'pending' as DownloadStatus,
              progress: 0,
            },
          ],
        })),

      updateProgress: (messageId, progress) =>
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.messageId === messageId ? { ...d, progress, status: d.status === 'completed' ? 'completed' : 'downloading' as DownloadStatus } : d
          ),
        })),

      setStatus: (messageId, status, localUri) =>
        set((state) => ({
          downloads: state.downloads.map((d) =>
            d.messageId === messageId
              ? {
                  ...d,
                  status,
                  localUri: localUri ?? d.localUri,
                  sizeBytes: sizeBytes ?? d.sizeBytes,
                  progress: status === 'completed' ? 100 : d.progress,
                  downloadedAt:
                    status === 'completed' ? new Date().toISOString() : d.downloadedAt,
                }
              : d
          ),
        })),

      removeDownload: (messageId) =>
        set((state) => ({
          downloads: state.downloads.filter((d) => d.messageId !== messageId),
        })),

      isDownloaded: (messageId) =>
        get().downloads.some((d) => d.messageId === messageId && d.status === 'completed'),

      getDownload: (messageId) =>
        get().downloads.find((d) => d.messageId === messageId),
    }),
    {
      name: 'rooted-downloads',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
