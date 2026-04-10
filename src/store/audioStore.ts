import { create } from 'zustand';
import type { AudioMessage, PlayerState, PlaybackSpeed, QueueItem } from '@/types';

interface AudioStore {
  // Current playback
  currentMessage: AudioMessage | null;
  queue: QueueItem[];
  queueIndex: number;
  playerState: PlayerState;
  progress: number;        // 0-1
  duration: number;        // seconds
  position: number;        // seconds
  seekTime: number | null; // seconds
  speed: PlaybackSpeed;
  isMiniPlayerVisible: boolean;
  isFullPlayerVisible: boolean;

  // Actions
  setCurrentMessage: (message: AudioMessage) => void;
  setQueue: (items: QueueItem[], startIndex?: number) => void;
  setPlayerState: (state: PlayerState) => void;
  setProgress: (progress: number) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  seekTo: (position: number) => void;
  clearPlayer: () => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  currentMessage: null,
  queue: [],
  queueIndex: 0,
  playerState: 'idle',
  progress: 0,
  duration: 0,
  position: 0,
  seekTime: null,
  speed: 1.0,
  isMiniPlayerVisible: false,
  isFullPlayerVisible: false,
  seekTo: (time: number) => set({ seekTime: time, position: time }),

  setCurrentMessage: (message) =>
    set({ currentMessage: message, isMiniPlayerVisible: true }),

  setQueue: (items, startIndex = 0) =>
    set({ queue: items, queueIndex: startIndex }),

  setPlayerState: (state) => set({ playerState: state }),

  setProgress: (progress) => set({ progress }),

  setPosition: (position) => set({ position }),

  setDuration: (duration) => set({ duration }),

  setSpeed: (speed) => set({ speed }),

  showMiniPlayer: () => set({ isMiniPlayerVisible: true }),

  hideMiniPlayer: () => set({ isMiniPlayerVisible: false }),

  openFullPlayer: () => set({ isFullPlayerVisible: true }),

  closeFullPlayer: () => set({ isFullPlayerVisible: false }),

  clearPlayer: () =>
    set({
      currentMessage: null,
      queue: [],
      queueIndex: 0,
      playerState: 'idle',
      progress: 0,
      duration: 0,
      position: 0,
      isMiniPlayerVisible: false,
      isFullPlayerVisible: false,
    }),
}));
