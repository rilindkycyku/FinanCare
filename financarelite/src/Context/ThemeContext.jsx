import { createContext, useContext, useEffect, useState } from "react";

const THEME_KEY = "financarelite-theme";
const ThemeContext = createContext(null);

function readInitialTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Toggles `body.light-mode`, which activates the light-theme CSS variable overrides already
 * defined in PremiumTheme.css. Persisted to localStorage; index.html applies the saved choice
 * before React mounts so there's no flash of the wrong theme. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* localStorage unavailable — theme still applies for this session */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
