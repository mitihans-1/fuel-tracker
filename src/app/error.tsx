"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, ShieldAlert, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a professional system, you would log this to Sentry or a similar service
    console.error("Critical System Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20"
        >
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Critical Failure</h1>
          <h2 className="text-xl font-bold text-slate-400">Synchronization Interrupted</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            The grid telemetry encountered an unexpected exception. 
            Automated protocols are attempting to stabilize the connection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-10 py-5 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-2 group"
          >
            <RefreshCcw className="w-4 h-4 group-active:rotate-180 transition-transform" />
            Re-Initialize Node
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-10 py-5 bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Abort to Terminal
          </Link>
        </div>

        <div className="pt-10">
           <div className="inline-block p-4 rounded-2xl bg-black/40 border border-white/5 text-left w-full">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Error Diagnostic Log:</p>
              <code className="text-xs text-red-400/80 font-mono break-all line-clamp-2">
                 {error.message || "Unknown grid exception"}
              </code>
           </div>
        </div>
      </div>
    </div>
  );
}
