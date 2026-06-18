"use client";

const SCROLL_RESTORE_KEY = "kindling:scroll-restore";

export function captureScrollPosition() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(SCROLL_RESTORE_KEY, String(window.scrollY));
}

export function refreshInPlace(router: { refresh: () => void }) {
  captureScrollPosition();
  router.refresh();
}

export function readAndClearScrollRestoreTarget(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(SCROLL_RESTORE_KEY);

  if (raw === null) {
    return null;
  }

  sessionStorage.removeItem(SCROLL_RESTORE_KEY);
  const value = Number(raw);

  return Number.isFinite(value) ? value : null;
}
