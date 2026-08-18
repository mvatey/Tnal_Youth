"use client";

/*
 * Persists "the user crossed out the connect-Telegram reminder" across page
 * loads/navigations within the same login, using localStorage keyed by the
 * user's own id -- not plain component state, which would reset (and
 * re-show the banner) on every remount. AuthContext#logout clears this key,
 * so the reminder comes back the next time this user logs back in; it's
 * also never shown again at all once telegram/connect-info reports the
 * account as actually connected (that check lives in the banner itself,
 * not here).
 */

const STORAGE_KEY_PREFIX = "tnal-telegram-connect-banner-dismissed:";

function storageKey(userId) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function isTelegramBannerDismissed(userId) {
  if (!userId || typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(storageKey(userId)) === "1";
  } catch {
    // Storage can be unavailable (e.g. private browsing) -- default to shown.
    return false;
  }
}

export function dismissTelegramBanner(userId) {
  if (!userId || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(storageKey(userId), "1");
  } catch {
    // Best-effort only -- dismissal just won't persist across reloads.
  }
}

export function clearTelegramBannerDismissal(userId) {
  if (!userId || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Best-effort only.
  }
}
