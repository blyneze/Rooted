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
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'New Series Released!',
    body: 'Dive into the newest teaching series "Faith & Power" available now in the library.',
    type: 'new_series',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), 
  },
  {
    id: 'n2',
    title: 'Live Event Reminder',
    body: 'Join us tonight at 7 PM for a special live session with Pastor Yemi.',
    type: 'reminder',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'n3',
    title: 'New Book Added',
    body: 'A new book "Rooted in the Word" has been added to the bookstore.',
    type: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  }
];
export const SAMPLE_HIGHLIGHTS: Highlight[] = [];
export const SAMPLE_NOTES: BibleNote[] = [];
