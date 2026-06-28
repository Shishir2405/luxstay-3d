'use client';

import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'luxstay-theme';

interface ThemeState {
  theme: Theme;
  /** Reads the class the pre-paint script already applied; call once on mount. */
  hydrate: () => void;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

function apply(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage blocked — non-fatal */
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  hydrate: () => {
    if (typeof document === 'undefined') return;
    const isDark = document.documentElement.classList.contains('dark');
    set({ theme: isDark ? 'dark' : 'light' });
  },
  setTheme: (theme) => {
    apply(theme);
    set({ theme });
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    apply(next);
    set({ theme: next });
  },
}));
