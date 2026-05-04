"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import PageLayout from "@/components/PageLayout";

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
    <PageLayout
      title="Customize Experience"
      subtitle="Choose a theme that matches your style. Your selection will instantly update the entire app interface."
    >
      <div className="space-y-12">
        {/* INSTRUCTIONS */}
        <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-sm text-slate-600 shadow-sm">
          <p className="font-black text-slate-900 mb-4 uppercase tracking-widest text-xs">Protocol Instructions:</p>
          <ul className="space-y-3 font-medium">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Click on any theme card below to initialize synchronization.
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              The system will instantly apply the selected visual layer.
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Preferences are automatically committed to local grid storage.
            </li>
          </ul>
        </div>

        {/* THEMES GRID */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((t) => {
            const isActive = theme === t.value;

            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left
                ${
                  isActive
                    ? "border-indigo-500 bg-white shadow-2xl scale-[1.02] ring-4 ring-indigo-500/10"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {/* ACTIVE BADGE */}
                {isActive && (
                  <span className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                    Active
                  </span>
                )}

                {/* ICON */}
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{t.icon}</div>

                {/* TITLE */}
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.name}</h2>

                {/* DESCRIPTION */}
                <p className="text-slate-600 text-sm font-medium mt-3 leading-relaxed">{t.desc}</p>

                {/* PREVIEW BAR */}
                <div className={`mt-8 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500 ${isActive ? "w-full opacity-100" : "w-12 opacity-30 group-hover:w-24 group-hover:opacity-70"}`} />
              </button>
            );
          })}
        </div>

        {/* FOOTER NOTE */}
        <div className="max-w-3xl mx-auto pt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Global theme preference synchronized across all nodes.
        </div>
      </div>
    </PageLayout>
  );
}