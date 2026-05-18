// ─── Global TypeScript Types ──────────────────────────────────────────────────

// ── API / Response Shapes ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// ── User ─────────────────────────────────────────────────────────────────────

export type SubscriptionTier = 'free' | 'premium';

export interface UserProfile {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  tier: SubscriptionTier;
  createdAt: string;
}

// ── Speaker ───────────────────────────────────────────────────────────────────

export interface Speaker {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  bio?: string;
}

// ── Audio Message ─────────────────────────────────────────────────────────────

export interface AudioMessage {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;           // seconds
  speakerName: string;
  speaker?: Speaker;
  series?: Series;
  topicTags: string[];
  category: string;
  isFeatured: boolean;
  isDownloaded: boolean;
  isSaved: boolean;
  publishedAt: string;        // ISO date string
  playbackProgress?: number;  // 0-1 fraction
  isPremium: boolean;
  partNumber?: number;
}

// ── Video Message ─────────────────────────────────────────────────────────────

export interface VideoMessage {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: number;           // seconds
  speakerName: string;
  coverUrl?: string;
  speaker?: Speaker;
  series?: Series;
  topicTags: string[];
  isFeatured: boolean;
  isSaved: boolean;
  publishedAt: string;        // ISO date string
  playbackProgress?: number;  // 0-1 fraction
  isPremium: boolean;
}

// ── Series ────────────────────────────────────────────────────────────────────

export interface Series {
  id: string;
  name: string;
  description: string;
  artworkUrl: string;
  messageCount: number;
  topics: string[];
  messages: AudioMessage[];
  isSaved?: boolean;
}

// ── Book ──────────────────────────────────────────────────────────────────────

export interface Book {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  fileUrl?: string;
  author: string;
  category: string;
  isPremium: boolean;
  readingProgress?: number;   // 0-1 fraction
  isSaved?: boolean;
  pageCount?: number;
}

// ── Playlist ──────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  items: AudioMessage[];
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Downloads ─────────────────────────────────────────────────────────────────

export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed';

export interface DownloadItem {
  id: string;
  messageId: string;
  title: string;
  coverUrl: string;
  speaker: string;
  status: DownloadStatus;
  progress: number;           // 0-100
  remoteUrl: string;
  mediaType: 'audio' | 'video' | 'book';
  localUri?: string;
  sizeBytes?: number;
  downloadedAt?: string;
}

// ── Bible ─────────────────────────────────────────────────────────────────────

export interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  testament: 'old' | 'new';
  chapterCount: number;
}

export interface BibleChapter {
  bookId: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleVerse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;          // e.g. "John 3:16"
  displayReference?: string;  // e.g. "John 3:16" formatted for display
}

export type HighlightColor = 'yellow' | 'red' | 'green' | 'blue' | 'purple';

export interface Highlight {
  id: string;
  userId: string;
  verseReference: string;     // "John 3:16"
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  color: HighlightColor;
  createdAt: string;
}

export interface BibleNote {
  id: string;
  userId: string;
  verseReference: string;
  bookId: string;
  chapter: number;
  verse: number;
  verseText: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkVerse {
  id: string;
  userId: string;
  verseReference: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  createdAt: string;
}

export interface BibleReadingPosition {
  bookId: string;
  bookName: string;
  chapter: number;
}

// ── Audio Player ──────────────────────────────────────────────────────────────

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'buffering';

export interface QueueItem {
  id: string;
  title: string;
  artist: string;         // Speaker name
  artwork: string;
  url: string;
  duration: number;
  seriesName?: string;
  messageId: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType = 'new_message' | 'new_series' | 'reminder' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  imageUrl?: string;
  actionRoute?: string;
  createdAt: string;
}

// ── Search ────────────────────────────────────────────────────────────────────

export type SearchResultType = 'message' | 'series' | 'book' | 'video';

export interface SearchResult {
  type: SearchResultType;
  item: AudioMessage | Series | Book | VideoMessage;
}

export type SearchFilterType = 'all' | 'audio' | 'video' | 'series' | 'books';

export type LibraryFilter = 'all' | 'audio' | 'videos' | 'books' | 'series' | 'playlists';
