import { useCallback, useLayoutEffect, useState } from "react";
import {
  getActiveThemeFromDocument,
  toggleTheme as flipTheme,
  type Theme,
} from "../lib/theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useLayoutEffect(() => {
    setTheme(getActiveThemeFromDocument());
  }, []);

  const toggleTheme = useCallback(() => {
    const next = flipTheme(getActiveThemeFromDocument());
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
