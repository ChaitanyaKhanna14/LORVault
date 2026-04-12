import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Appearance, Platform } from 'react-native';
import {
  ThemeColors,
  getThemeColors,
  getThemeShadows,
  FontFamily,
  Typography,
  Spacing,
  BorderRadius,
} from '@/utils/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeState {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  shadows: ReturnType<typeof getThemeShadows>;
  fonts: typeof FontFamily;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radius: typeof BorderRadius;

  // Actions
  initialize: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THEME_KEY = 'theme_preference';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveIsDark(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return Appearance.getColorScheme() === 'dark';
  }
  return mode === 'dark';
}

function buildThemeState(isDark: boolean) {
  return {
    isDark,
    colors: getThemeColors(isDark),
    shadows: getThemeShadows(isDark),
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for system theme changes
  Appearance.addChangeListener(({ colorScheme }) => {
    const { themeMode } = get();
    if (themeMode === 'system') {
      const isDark = colorScheme === 'dark';
      set(buildThemeState(isDark));
    }
  });

  const initialIsDark = resolveIsDark('system');

  return {
    themeMode: 'system',
    ...buildThemeState(initialIsDark),
    fonts: FontFamily,
    typography: Typography,
    spacing: Spacing,
    radius: BorderRadius,

    initialize: async () => {
      try {
        let stored: string | null = null;
        if (Platform.OS === 'web') {
          // SecureStore not available on web
          stored = null;
        } else {
          stored = await SecureStore.getItemAsync(THEME_KEY);
        }

        if (stored && (stored === 'system' || stored === 'light' || stored === 'dark')) {
          const mode = stored as ThemeMode;
          const isDark = resolveIsDark(mode);
          set({
            themeMode: mode,
            ...buildThemeState(isDark),
          });
        }
      } catch {
        // Fallback to system default — already set
      }
    },

    setTheme: async (mode: ThemeMode) => {
      const isDark = resolveIsDark(mode);
      set({
        themeMode: mode,
        ...buildThemeState(isDark),
      });

      try {
        if (Platform.OS !== 'web') {
          await SecureStore.setItemAsync(THEME_KEY, mode);
        }
      } catch {
        // Persist failed — theme still applied in memory
      }
    },
  };
});

// ---------------------------------------------------------------------------
// Convenience hook
// ---------------------------------------------------------------------------

export function useTheme() {
  const {
    themeMode,
    isDark,
    colors,
    shadows,
    fonts,
    typography,
    spacing,
    radius,
  } = useThemeStore();

  return {
    themeMode,
    isDark,
    colors,
    shadows,
    fonts,
    typography,
    spacing,
    radius,
  };
}
