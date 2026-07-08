export type Theme = "light" | "dark";

const STORAGE_KEY = "wrytesmart-theme";
const LEGACY_STORAGE_KEY = "inkwell-theme";

export function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "light" || legacy === "dark") {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function getActiveThemeFromDocument(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function getPreferredTheme(): Theme {
  return "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function initTheme(): Theme {
  const theme = getPreferredTheme();
  applyTheme(theme);
  return theme;
}

export function persistTheme(theme: Theme): void {
  applyTheme(theme);
}

export function toggleTheme(current: Theme): Theme {
  const next = current === "light" ? "dark" : "light";
  persistTheme(next);
  return next;
}
