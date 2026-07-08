import { useCallback, useState } from "react";
import type { Theme } from "../lib/theme";
import styles from "./ThemeToggle.module.css";

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  variant?: "default" | "toolbar";
}

export function ThemeToggle({ theme, onToggle, variant = "default" }: ThemeToggleProps) {
  const isDark = theme === "dark";
  const [switching, setSwitching] = useState(false);

  const handleToggle = useCallback(() => {
    setSwitching(true);
    onToggle();
    window.setTimeout(() => setSwitching(false), 420);
  }, [onToggle]);

  return (
    <button
      type="button"
      className={`${styles.toggle} ${variant === "toolbar" ? styles.toggleToolbar : ""} ${isDark ? styles.isDark : styles.isLight} ${switching ? styles.switching : ""}`}
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      suppressHydrationWarning
    >
      <span className={styles.icon} aria-hidden="true">
        {isDark ? "☀" : "☾"}
      </span>
    </button>
  );
}
