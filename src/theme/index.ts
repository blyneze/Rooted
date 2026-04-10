// ─── Rooted Design System ────────────────────────────────────────────────────
// Grayscale-first palette with a single #FF3B30 accent.
// All surfaces are near-blacks and dark grays.

export const colors = {
  // ── Backgrounds / Surfaces ─────────────────────────────────────────────────
  background: '#FFFFFF',       // Full white — root background
  surface: '#F2F2F7',          // Light gray — cards, sheets, elevated containers
  surfaceElevated: '#FFFFFF',  // White for modals/popovers
  surfaceMid: '#E5E5EA',       // Dividers, input backgrounds
  surfaceBorder: '#C6C6C8',    // Subtle borders

  // ── Text Hierarchy ─────────────────────────────────────────────────────────
  textPrimary: '#000000',      // Headlines, primary labels
  textSecondary: '#666666',    // Subtitles, secondary info
  textTertiary: '#999999',     // Captions, placeholders, disabled
  textInverse: '#FFFFFF',      // Text on dark backgrounds

  // ── Accent ─────────────────────────────────────────────────────────────────
  accent: '#FF3B30',           // Actions, active states, CTAs
  accentMuted: 'rgba(255, 59, 48, 0.10)', // Soft accent for backgrounds
  accentDim: 'rgba(255, 59, 48, 0.25)',   // Mid accent for selected states

  // ── Semantic ───────────────────────────────────────────────────────────────
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // ── Highlight Colors (Bible) ────────────────────────────────────────────────
  highlight: {
    yellow: 'rgba(255, 214, 10, 0.40)',
    red: 'rgba(255, 59, 48, 0.35)',
    green: 'rgba(52, 199, 89, 0.35)',
    blue: 'rgba(10, 132, 255, 0.35)',
    purple: 'rgba(175, 82, 222, 0.35)',
  },

  // ── Overlays ───────────────────────────────────────────────────────────────
  overlay: 'rgba(0, 0, 0, 0.40)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',

  // ── Transparent ────────────────────────────────────────────────────────────
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.3,
  wider: 0.8,
  widest: 1.5,
} as const;

export const iconSize = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
  '2xl': 40,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export const zIndex = {
  base: 0,
  elevated: 10,
  overlay: 20,
  modal: 30,
  player: 40,
  toast: 50,
} as const;

const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  iconSize,
  shadow,
  zIndex,
};

export type Theme = typeof theme;
export default theme;
