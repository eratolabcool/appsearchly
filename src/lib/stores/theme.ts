import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'appsearchly-theme';

function getInitialTheme(): Theme {
  if (!browser) return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // storage unavailable — fall through to light
  }
  return 'light';
}

export function applyTheme(theme: Theme): void {
  if (!browser) return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function initTheme(): void {
  const current = getInitialTheme();
  theme.set(current);
  applyTheme(current);
}

export function toggleTheme(): void {
  theme.update((current) => {
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    return next;
  });
}

export const theme = writable<Theme>('light');
