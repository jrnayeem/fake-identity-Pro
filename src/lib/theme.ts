const KEY = "fakenames-theme";
export type Theme = "light" | "dark";

function systemTheme(): Theme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function initTheme(): Theme {
  let stored: Theme | null = null;
  try { stored = localStorage.getItem(KEY) as Theme | null; } catch {}
  const theme = stored ?? systemTheme();
  applyTheme(theme);
  return theme;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme: Theme): void {
  try { localStorage.setItem(KEY, theme); } catch {}
  applyTheme(theme);
}
