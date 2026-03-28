"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

const themes = [
  { name: "Dark", value: "dark", icon: "🌙", desc: "Best for night and low-light environments." },
  { name: "Light", value: "light", icon: "☀️", desc: "Clean and bright for daytime use." },
  { name: "Forest", value: "forest", icon: "🌲", desc: "Calm green tones inspired by nature." },
  { name: "Sunset", value: "sunset", icon: "🌅", desc: "Warm and vibrant evening colors." },
  { name: "Purple", value: "purple", icon: "🌌", desc: "Creative and modern purple shades." },
  { name: "Cyber", value: "cyber", icon: "💎", desc: "Futuristic neon cyberpunk style." },
] as const;

export default function ThemePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-bg text-text px-4 py-10 sm:px-6 lg:px-12">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Customize Your Experience 🎨
        </h1>
        <p className="text-text/70 text-sm sm:text-base">
          Choose a theme that matches your style. Your selection will instantly update the entire app interface.
        </p>
      </div>

      {/* INSTRUCTIONS */}
      <div className="max-w-3xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-text/70">
        <p className="font-semibold text-text mb-2">How to use:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click on any theme card below</li>
          <li>The app will instantly apply the theme</li>
          <li>Your preference will be saved automatically</li>
        </ul>
      </div>

      {/* THEMES GRID */}
      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => {
          const isActive = theme === t.value;

          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 text-left
              ${
                isActive
                  ? "border-primary bg-primary/10 shadow-xl scale-[1.02]"
                  : "border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02]"
              }`}
            >
              {/* ACTIVE BADGE */}
              {isActive && (
                <span className="absolute top-3 right-3 text-xs bg-primary text-white px-2 py-1 rounded-full">
                  Active
                </span>
              )}

              {/* ICON */}
              <div className="text-4xl mb-3">{t.icon}</div>

              {/* TITLE */}
              <h2 className="text-xl font-bold">{t.name}</h2>

              {/* DESCRIPTION */}
              <p className="text-sm text-text/70 mt-2">{t.desc}</p>

              {/* PREVIEW BAR */}
              <div className="mt-4 h-2 rounded-full bg-gradient-to-r from-primary to-secondary opacity-70 group-hover:opacity-100 transition" />
            </button>
          );
        })}
      </div>

      {/* FOOTER NOTE */}
      <div className="max-w-3xl mx-auto mt-12 text-center text-xs text-text/50">
        Your theme preference is applied across all pages including dashboard, analytics, and notifications.
      </div>
    </div>
  );
}