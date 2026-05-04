"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20"
        >
          <AlertTriangle className="w-12 h-12 text-indigo-400" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-slate-300">Route Not Found</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            The coordinates you requested are outside the FuelSync grid. 
            The resource may have been decommissioned or relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group"
          >
            <Home className="w-4 h-4" />
            Return to Terminal
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Node
          </button>
        </div>

        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] pt-8">
          FuelSync Operational Protocol v2.6
        </p>
      </div>
    </div>
  );
}
