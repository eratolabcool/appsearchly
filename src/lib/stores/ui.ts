import { writable } from 'svelte/store';

/** Mobile nav menu open state (shared with global Esc handler). */
export const mobileMenuOpen = writable(false);

/** Increment to ask the header to focus its search input (global `/` or Ctrl/Cmd+K). */
export const searchFocusRequest = writable(0);

/**
 * True when a keystroke should not trigger global shortcuts
 * (typing in an input/textarea or contenteditable).
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}
