import { createContext, useContext, useEffect, useState } from "react";

/**
 * ThemeContext — global dark/light mode store.
 *
 * Usage:
 *   const { theme, toggleTheme, isLight } = useTheme();
 *
 * The active theme class ("light-mode") is applied directly to <body> so
 * every page can scope overrides with:  body.light-mode .my-element { … }
 */

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("app-theme") || "dark"
  );

  // Sync <body> class & localStorage whenever theme changes
  useEffect(() => {
    const body = document.body;
    if (theme === "light") {
      body.classList.add("light-mode");
    } else {
      body.classList.remove("light-mode");
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLight: theme === "light" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
