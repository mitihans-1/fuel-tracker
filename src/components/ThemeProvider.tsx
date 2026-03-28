"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "forest" | "sunset" | "purple" | "cyber";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initializer function for state
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as Theme;
      if (saved) return saved;
    }
    return "dark";
  });

  useEffect(() => {
    // Sync document attribute on mount or when theme changes
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    // 2. Update state and localStorage
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    // 3. Backend sync placeholder
    // You can connect this to your backend later
    try {
      // await fetch("/api/user/theme", { method: "PATCH", body: JSON.stringify({ theme: newTheme }) });
      console.log(`Theme synced to backend: ${newTheme}`);
    } catch (err) {
      console.error("Failed to sync theme to backend", err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
