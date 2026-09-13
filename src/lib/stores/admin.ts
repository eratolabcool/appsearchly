import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'appsearchly-admin-token';

function initialToken(): string {
  if (!browser) return '';
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export const adminToken = writable<string>(initialToken());

adminToken.subscribe((token) => {
  if (!browser) return;
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
});

/**
 * Fetch with the admin Bearer token attached. Returns the raw Response so
 * callers can react to 401 (token missing/invalid).
 */
export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = get(adminToken);
  const headers = new Headers(options.headers ?? {});
  if (token) headers.set('authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}
