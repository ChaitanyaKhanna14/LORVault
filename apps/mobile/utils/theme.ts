// ============================================================================
// LORVault Design System — "The Sovereign Ledger"
// Extracted from Google Stitch Design System
// ============================================================================

// ---------------------------------------------------------------------------
// Color Palettes
// ---------------------------------------------------------------------------

export interface ThemeColors {
  // Primary (Indigo)
  primary: string;
  primaryContainer: string;
  primaryDim: string;
  primaryFixed: string;
  primaryFixedDim: string;
  onPrimary: string;
  onPrimaryContainer: string;
  onPrimaryFixed: string;
  onPrimaryFixedVariant: string;

  // Secondary (Teal)
  secondary: string;
  secondaryContainer: string;
  secondaryDim: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondary: string;
  onSecondaryContainer: string;
  onSecondaryFixed: string;
  onSecondaryFixedVariant: string;

  // Tertiary (Slate)
  tertiary: string;
  tertiaryContainer: string;
  tertiaryDim: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiary: string;
  onTertiaryContainer: string;
  onTertiaryFixed: string;
  onTertiaryFixedVariant: string;

  // Surface
  surface: string;
  surfaceBright: string;
  surfaceDim: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLow: string;
  surfaceContainerLowest: string;
  surfaceTint: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  onBackground: string;
  background: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Error
  error: string;
  errorContainer: string;
  errorDim: string;
  onError: string;
  onErrorContainer: string;

  // Outline
  outline: string;
  outlineVariant: string;
}

// Light palette — directly from Stitch design system tokens
export const LightColors: ThemeColors = {
  // Primary (Indigo)
  primary: '#4955B3',
  primaryContainer: '#DFE0FF',
  primaryDim: '#3C49A7',
  primaryFixed: '#DFE0FF',
  primaryFixedDim: '#CDD1FF',
  onPrimary: '#F9F6FF',
  onPrimaryContainer: '#3B48A6',
  onPrimaryFixed: '#273492',
  onPrimaryFixedVariant: '#4652B0',

  // Secondary (Teal)
  secondary: '#15696D',
  secondaryContainer: '#A6EFF3',
  secondaryDim: '#005D61',
  secondaryFixed: '#A6EFF3',
  secondaryFixedDim: '#98E1E5',
  onSecondary: '#E4FEFF',
  onSecondaryContainer: '#005B5F',
  onSecondaryFixed: '#00474A',
  onSecondaryFixedVariant: '#0E666A',

  // Tertiary (Slate)
  tertiary: '#4D626C',
  tertiaryContainer: '#D8EFFB',
  tertiaryDim: '#415660',
  tertiaryFixed: '#D8EFFB',
  tertiaryFixedDim: '#CAE0EC',
  onTertiary: '#F2FAFF',
  onTertiaryContainer: '#455A64',
  onTertiaryFixed: '#334751',
  onTertiaryFixedVariant: '#4F646E',

  // Surface
  surface: '#F7F9FB',
  surfaceBright: '#F7F9FB',
  surfaceDim: '#CFDCE3',
  surfaceContainer: '#E8EFF3',
  surfaceContainerHigh: '#E1E9EE',
  surfaceContainerHighest: '#D9E4EA',
  surfaceContainerLow: '#F0F4F7',
  surfaceContainerLowest: '#FFFFFF',
  surfaceTint: '#4955B3',
  surfaceVariant: '#D9E4EA',
  onSurface: '#2A3439',
  onSurfaceVariant: '#566166',
  onBackground: '#2A3439',
  background: '#F7F9FB',

  // Inverse
  inverseSurface: '#0B0F10',
  inverseOnSurface: '#9A9D9F',
  inversePrimary: '#8C99FC',

  // Error
  error: '#9F403D',
  errorContainer: '#FE8983',
  errorDim: '#4E0309',
  onError: '#FFF7F6',
  onErrorContainer: '#752121',

  // Outline
  outline: '#717C82',
  outlineVariant: '#A9B4B9',
};

// Dark palette — Material 3 inversion of the Stitch light tokens
export const DarkColors: ThemeColors = {
  // Primary (Indigo) — swap primary ↔ onPrimary logic
  primary: '#CDD1FF',
  primaryContainer: '#3B48A6',
  primaryDim: '#8C99FC',
  primaryFixed: '#DFE0FF',
  primaryFixedDim: '#CDD1FF',
  onPrimary: '#273492',
  onPrimaryContainer: '#DFE0FF',
  onPrimaryFixed: '#273492',
  onPrimaryFixedVariant: '#4652B0',

  // Secondary (Teal)
  secondary: '#98E1E5',
  secondaryContainer: '#005B5F',
  secondaryDim: '#4DD8DD',
  secondaryFixed: '#A6EFF3',
  secondaryFixedDim: '#98E1E5',
  onSecondary: '#00474A',
  onSecondaryContainer: '#A6EFF3',
  onSecondaryFixed: '#00474A',
  onSecondaryFixedVariant: '#0E666A',

  // Tertiary (Slate)
  tertiary: '#CAE0EC',
  tertiaryContainer: '#455A64',
  tertiaryDim: '#8FAAB8',
  tertiaryFixed: '#D8EFFB',
  tertiaryFixedDim: '#CAE0EC',
  onTertiary: '#334751',
  onTertiaryContainer: '#D8EFFB',
  onTertiaryFixed: '#334751',
  onTertiaryFixedVariant: '#4F646E',

  // Surface — dark neutrals
  surface: '#0F1416',
  surfaceBright: '#374044',
  surfaceDim: '#0F1416',
  surfaceContainer: '#1A2024',
  surfaceContainerHigh: '#252D31',
  surfaceContainerHighest: '#30383C',
  surfaceContainerLow: '#161C1F',
  surfaceContainerLowest: '#0B0F10',
  surfaceTint: '#CDD1FF',
  surfaceVariant: '#3A4449',
  onSurface: '#D9E4EA',
  onSurfaceVariant: '#A9B4B9',
  onBackground: '#D9E4EA',
  background: '#0F1416',

  // Inverse
  inverseSurface: '#D9E4EA',
  inverseOnSurface: '#2A3439',
  inversePrimary: '#4955B3',

  // Error
  error: '#FE8983',
  errorContainer: '#752121',
  errorDim: '#FF5449',
  onError: '#4E0309',
  onErrorContainer: '#FE8983',

  // Outline
  outline: '#8A959A',
  outlineVariant: '#3A4449',
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const FontFamily = {
  // Headlines & Display — editorial voice
  manropeRegular: 'Manrope_400Regular',
  manropeMedium: 'Manrope_500Medium',
  manropeSemiBold: 'Manrope_600SemiBold',
  manropeBold: 'Manrope_700Bold',
  manropeExtraBold: 'Manrope_800ExtraBold',

  // Body & Labels — functional voice
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

export const Typography = {
  displayLg: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72, // -0.02em
  },
  displayMd: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  headlineLg: {
    fontFamily: FontFamily.manropeBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.48,
  },
  headlineMd: {
    fontFamily: FontFamily.manropeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.44,
  },
  headlineSm: {
    fontFamily: FontFamily.manropeSemiBold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.36,
  },
  titleLg: {
    fontFamily: FontFamily.manropeSemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.16,
  },
  titleMd: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
  },
  titleSm: {
    fontFamily: FontFamily.interSemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: FontFamily.interRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: FontFamily.interRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  bodySm: {
    fontFamily: FontFamily.interRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  labelLg: {
    fontFamily: FontFamily.interMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMd: {
    fontFamily: FontFamily.interMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSm: {
    fontFamily: FontFamily.interMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const Shadows = {
  light: {
    // "Signature Ambient Shadow" — tinted with onSurface color
    ambient: {
      shadowColor: '#2A3439',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.06,
      shadowRadius: 32,
      elevation: 4,
    },
    // Subtle card lift
    card: {
      shadowColor: '#2A3439',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 16,
      elevation: 2,
    },
    // No shadow (surface hierarchy only)
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
  dark: {
    ambient: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 32,
      elevation: 8,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 4,
    },
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Role Accents
// ---------------------------------------------------------------------------

export type UserRole = 'teacher' | 'admin' | 'student' | 'superAdmin' | 'external';

export const RoleAccent: Record<UserRole, { light: string; dark: string }> = {
  teacher: { light: LightColors.primary, dark: DarkColors.primary },
  admin: { light: LightColors.primary, dark: DarkColors.primary },
  student: { light: LightColors.tertiary, dark: DarkColors.tertiary },
  superAdmin: { light: LightColors.secondary, dark: DarkColors.secondary },
  external: { light: LightColors.tertiary, dark: DarkColors.tertiary },
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getThemeColors(isDark: boolean): ThemeColors {
  return isDark ? DarkColors : LightColors;
}

export function getThemeShadows(isDark: boolean) {
  return isDark ? Shadows.dark : Shadows.light;
}

export function getRoleAccent(role: UserRole, isDark: boolean): string {
  return isDark ? RoleAccent[role].dark : RoleAccent[role].light;
}
