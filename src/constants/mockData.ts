import type { AudioMessage, Series, Book, Playlist, AppNotification, Highlight, BibleNote } from '@/types';

export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const formatDurationLabel = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
};

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const AUDIO_MESSAGES: AudioMessage[] = [];
export const SERIES_LIST: Series[] = [];
export const BOOKS: Book[] = [];
export const PLAYLISTS: Playlist[] = [];
export const NOTIFICATIONS: AppNotification[] = [];
export const SAMPLE_HIGHLIGHTS: Highlight[] = [];
export const SAMPLE_NOTES: BibleNote[] = [];
