import * as FileSystem from 'expo-file-system/legacy';
import { useDownloadStore } from '@/store/downloadStore';

class MediaDownloadService {
  private static instance: MediaDownloadService;
  private isProcessing = false;

  private constructor() {
    this.ensureDir();
  }

  public static getInstance(): MediaDownloadService {
    if (!MediaDownloadService.instance) {
      MediaDownloadService.instance = new MediaDownloadService();
    }
    return MediaDownloadService.instance;
  }

  private async ensureDir() {
    try {
      const dir = `${FileSystem.documentDirectory}downloads/`;
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      return dir;
    } catch (error) {
      console.error('Error ensuring download directory:', error);
      return `${FileSystem.documentDirectory}`;
    }
  }

  /**
   * Starts processing the queue based on items in the DownloadStore with 'pending' status.
   */
  public async processQueue() {
    if (this.isProcessing) return;

    const { downloads, setStatus, updateProgress } = useDownloadStore.getState();
    const nextItem = downloads.find((d) => d.status === 'pending');

    if (!nextItem) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    console.log(`[DownloadService] Starting download for: ${nextItem.title}`);

    try {
      const dir = await this.ensureDir();
      const extension = nextItem.remoteUrl.split('.').pop() || 'mp3';
      const filename = `${nextItem.messageId}.${extension}`;
      const localUri = `${dir}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        nextItem.remoteUrl,
        localUri,
        {},
        (progress) => {
          const p = Math.round(
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100
          );
          // Only update on meaningful changes to avoid excessive re-renders
          if (p % 5 === 0 || p === 100) {
            updateProgress(nextItem.messageId, p);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        console.log(`[DownloadService] Download completed: ${result.uri}`);
        setStatus(nextItem.messageId, 'completed', result.uri);
      } else {
        throw new Error('Download failed: No URI returned');
      }
    } catch (error) {
      console.error('[DownloadService] Error:', error);
      setStatus(nextItem.messageId, 'failed');
    } finally {
      this.isProcessing = false;
      // Small delay before next item to avoid tight loops on failure
      setTimeout(() => this.processQueue(), 500);
    }
  }

  /**
   * Deletes a local file and removes it from the store
   */
  public async removeDownload(messageId: string) {
    const { downloads, removeDownload } = useDownloadStore.getState();
    const item = downloads.find((d) => d.messageId === messageId);

    if (item?.localUri) {
      try {
        const info = await FileSystem.getInfoAsync(item.localUri);
        if (info.exists) {
          await FileSystem.deleteAsync(item.localUri, { idempotent: true });
        }
      } catch (error) {
        console.error('[DownloadService] Error deleting file:', error);
      }
    }
    removeDownload(messageId);
  }
}

export const downloadService = MediaDownloadService.getInstance();
