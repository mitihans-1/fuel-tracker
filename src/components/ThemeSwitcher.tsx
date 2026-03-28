"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

const themes = [
  { name: "Dark", value: "dark", icon: "🌙" },
  { name: "Light", value: "light", icon: "☀️" },
  { name: "Forest", value: "forest", icon: "🌲" },
  { name: "Sunset", value: "sunset", icon: "🌅" },
  { name: "Purple", value: "purple", icon: "🌌" },
  { name: "Cyber", value: "cyber", icon: "💎" },
] as const;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
 const [mounted, setMounted] = useState(false);

useEffect(() => {
  const id = requestAnimationFrame(() => setMounted(true));
  return () => cancelAnimationFrame(id);
}, []);

  return (
    <div className="flex items-center gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            mounted && theme === t.value
              ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          title={t.name}
        >
          <h1>hi</h1>
          <span>{t.icon}</span>
          <span className="hidden md:inline">{t.name}</span>
        </button>
      ))}
    </div>
  );
}
