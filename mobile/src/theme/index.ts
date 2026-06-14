import {MD3DarkTheme, MD3LightTheme, configureFonts} from 'react-native-paper';
import type {MD3Theme} from 'react-native-paper';

/**
 * Raw colour scale. Components should reference the semantic `colors` map below
 * rather than these directly, so the palette can evolve in one place.
 */
export const palette = {
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo900: '#312E81',

  emerald50: '#ECFDF5',
  emerald500: '#10B981',
  emerald600: '#059669',

  amber50: '#FFFBEB',
  amber500: '#F59E0B',

  red50: '#FEF2F2',
  red500: '#EF4444',

  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate800: '#1E293B',
  slate900: '#0F172A',

  white: '#FFFFFF',
  black: '#000000',
} as const;

/**
 * Semantic colours for light mode — the default surface for the app.
 */
export const colors = {
  primary: palette.indigo500,
  primaryDark: palette.indigo600,
  primaryContainer: palette.indigo100,
  onPrimary: palette.white,
  secondary: palette.indigo400,

  accent: palette.emerald500,
  success: palette.emerald500,
  successContainer: palette.emerald50,
  warning: palette.amber500,
  warningContainer: palette.amber50,
  error: palette.red500,
  errorContainer: palette.red50,

  background: palette.slate50,
  surface: palette.white,
  surfaceAlt: palette.slate100,

  text: palette.slate900,
  textSecondary: palette.slate600,
  muted: palette.slate500,
  border: palette.slate200,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/** Corner radii — generous, soft rounding reads as modern/friendly. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

/** Subtle, consistent elevation presets (iOS shadow + Android elevation). */
export const elevation = {
  none: {},
  sm: {
    shadowColor: palette.slate900,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  md: {
    shadowColor: palette.slate900,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
};

// Bolder, tighter headings; comfortable body line-heights. Applied via MD3 so
// every Paper <Text variant> picks them up app-wide.
const fontConfig = {
  headlineMedium: {fontWeight: '700' as const, letterSpacing: -0.4},
  headlineSmall: {fontWeight: '700' as const, letterSpacing: -0.3},
  titleLarge: {fontWeight: '700' as const, letterSpacing: -0.2},
  titleMedium: {fontWeight: '600' as const},
  titleSmall: {fontWeight: '600' as const},
  labelLarge: {fontWeight: '600' as const},
};

const fonts = configureFonts({config: fontConfig});

export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryContainer,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceAlt,
    error: colors.error,
    outline: colors.border,
    outlineVariant: colors.border,
  },
  fonts,
};

/** Dark counterpart — opt-in (see App.tsx system-scheme selection). */
export const darkColors = {
  ...colors,
  primary: palette.indigo400,
  primaryContainer: palette.indigo900,
  background: palette.slate900,
  surface: palette.slate800,
  surfaceAlt: '#0B1220',
  text: palette.slate50,
  textSecondary: palette.slate300,
  muted: palette.slate400,
  border: '#27324A',
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: radius.md,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.primaryContainer,
    secondary: colors.secondary,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceAlt,
    error: colors.error,
    outline: darkColors.border,
  },
  fonts,
};

export type AppTheme = typeof theme;
