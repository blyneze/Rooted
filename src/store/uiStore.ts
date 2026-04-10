import { create } from 'zustand';
import type { LibraryFilter } from '@/types';

interface UIStore {
  libraryFilter: LibraryFilter;
  searchQuery: string;
  isSearchVisible: boolean;
  recentSearches: string[];

  setLibraryFilter: (filter: LibraryFilter) => void;
  setSearchQuery: (query: string) => void;
  showSearch: () => void;
  hideSearch: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  libraryFilter: 'all',
  searchQuery: '',
  isSearchVisible: false,
  recentSearches: [],

  setLibraryFilter: (filter) => set({ libraryFilter: filter }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  showSearch: () => set({ isSearchVisible: true }),

  hideSearch: () => set({ isSearchVisible: false, searchQuery: '' }),

  addRecentSearch: (query) => {
    if (!query.trim()) return;
    const current = get().recentSearches;
    const updated = [query, ...current.filter((q) => q !== query)].slice(0, 10);
    set({ recentSearches: updated });
  },

  clearRecentSearches: () => set({ recentSearches: [] }),
}));
