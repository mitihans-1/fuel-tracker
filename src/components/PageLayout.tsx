"use client";

import { ReactNode } from "react";
import ClientNavbar from "./ClientNavbar";
import { motion } from "framer-motion";

type PageLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <main className="min-h-screen text-slate-900 bg-white selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      <ClientNavbar />

      <div className="relative z-10 pt-28 pb-24 max-w-6xl mx-auto px-6 space-y-24">
        {/* HERO */}
        <section className="text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight"
          >
            {title}
          </motion.h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            {subtitle}
          </p>
        </section>

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </main>
  );
}