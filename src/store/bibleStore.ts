import { create } from 'zustand';
import type {
  Highlight,
  BibleNote,
  BookmarkVerse,
  BibleReadingPosition,
  HighlightColor,
} from '@/types';
import { SAMPLE_HIGHLIGHTS, SAMPLE_NOTES } from '@/constants/mockData';

interface BibleStore {
  readingPosition: BibleReadingPosition;
  highlights: Highlight[];
  notes: BibleNote[];
  bookmarks: BookmarkVerse[];
  fontSize: number;
  selectedVerseRef: string | null;

  // Actions
  setReadingPosition: (position: BibleReadingPosition) => void;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'userId' | 'createdAt'>) => void;
  removeHighlight: (verseReference: string) => void;
  getHighlightForVerse: (verseReference: string) => Highlight | undefined;
  addNote: (note: Omit<BibleNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNoteForVerse: (verseReference: string) => BibleNote | undefined;
  addBookmark: (bookmark: Omit<BookmarkVerse, 'id' | 'userId' | 'createdAt'>) => void;
  removeBookmark: (verseReference: string) => void;
  isBookmarked: (verseReference: string) => boolean;
  setFontSize: (size: number) => void;
  setSelectedVerse: (ref: string | null) => void;
}

export const useBibleStore = create<BibleStore>((set, get) => ({
  readingPosition: { bookId: 'john', bookName: 'John', chapter: 3 },
  highlights: SAMPLE_HIGHLIGHTS,
  notes: SAMPLE_NOTES,
  bookmarks: [],
  fontSize: 17,
  selectedVerseRef: null,

  setReadingPosition: (position) => set({ readingPosition: position }),

  addHighlight: (highlight) =>
    set((state) => ({
      highlights: [
        ...state.highlights.filter((h) => h.verseReference !== highlight.verseReference),
        {
          ...highlight,
          id: `hl_${Date.now()}`,
          userId: 'user_1',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  removeHighlight: (verseReference) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.verseReference !== verseReference),
    })),

  getHighlightForVerse: (verseReference) =>
    get().highlights.find((h) => h.verseReference === verseReference),

  addNote: (note) =>
    set((state) => ({
      notes: [
        ...state.notes.filter((n) => n.verseReference !== note.verseReference),
        {
          ...note,
          id: `note_${Date.now()}`,
          userId: 'user_1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateNote: (id, content) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n
      ),
    })),

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),

  getNoteForVerse: (verseReference) =>
    get().notes.find((n) => n.verseReference === verseReference),

  addBookmark: (bookmark) =>
    set((state) => ({
      bookmarks: [
        ...state.bookmarks.filter((b) => b.verseReference !== bookmark.verseReference),
        {
          ...bookmark,
          id: `bm_${Date.now()}`,
          userId: 'user_1',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  removeBookmark: (verseReference) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.verseReference !== verseReference),
    })),

  isBookmarked: (verseReference) =>
    get().bookmarks.some((b) => b.verseReference === verseReference),

  setFontSize: (size) => set({ fontSize: size }),

  setSelectedVerse: (ref) => set({ selectedVerseRef: ref }),
}));
