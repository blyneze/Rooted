import type { BibleBook, BibleChapter } from '@/types';

// ── Bible Books Catalog ────────────────────────────────────────────────────────

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { id: 'genesis', name: 'Genesis', shortName: 'Gen', testament: 'old', chapterCount: 50 },
  { id: 'exodus', name: 'Exodus', shortName: 'Exo', testament: 'old', chapterCount: 40 },
  { id: 'psalms', name: 'Psalms', shortName: 'Psa', testament: 'old', chapterCount: 150 },
  { id: 'proverbs', name: 'Proverbs', shortName: 'Pro', testament: 'old', chapterCount: 31 },
  { id: 'isaiah', name: 'Isaiah', shortName: 'Isa', testament: 'old', chapterCount: 66 },
  { id: 'jeremiah', name: 'Jeremiah', shortName: 'Jer', testament: 'old', chapterCount: 52 },
  // New Testament
  { id: 'matthew', name: 'Matthew', shortName: 'Mat', testament: 'new', chapterCount: 28 },
  { id: 'mark', name: 'Mark', shortName: 'Mar', testament: 'new', chapterCount: 16 },
  { id: 'luke', name: 'Luke', shortName: 'Luk', testament: 'new', chapterCount: 24 },
  { id: 'john', name: 'John', shortName: 'Joh', testament: 'new', chapterCount: 21 },
  { id: 'acts', name: 'Acts', shortName: 'Act', testament: 'new', chapterCount: 28 },
  { id: 'romans', name: 'Romans', shortName: 'Rom', testament: 'new', chapterCount: 16 },
  { id: 'ephesians', name: 'Ephesians', shortName: 'Eph', testament: 'new', chapterCount: 6 },
  { id: 'philippians', name: 'Philippians', shortName: 'Php', testament: 'new', chapterCount: 4 },
  { id: 'colossians', name: 'Colossians', shortName: 'Col', testament: 'new', chapterCount: 4 },
  { id: 'hebrews', name: 'Hebrews', shortName: 'Heb', testament: 'new', chapterCount: 13 },
  { id: 'james', name: 'James', shortName: 'Jam', testament: 'new', chapterCount: 5 },
  { id: 'revelation', name: 'Revelation', shortName: 'Rev', testament: 'new', chapterCount: 22 },
];

// ── Helper Helpers ───────────────────────────────────────────────────────────

export function getBibleBookById(id: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}

export const OLD_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === 'old');
export const NEW_TESTAMENT = BIBLE_BOOKS.filter((b) => b.testament === 'new');
