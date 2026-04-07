"use client";

import React, { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Key, Mail, ArrowRight, CheckCircle2,  } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.message || "Credential recovery failed.");
      }
    } catch {
      setError("System relay error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-indigo-500/30">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl text-indigo-400 shadow-xl border border-white/5 mb-8"
          >
            <Key className="w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Protocol Recovery</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Re-establish access credentials</p>
        </div>

        <motion.div 
          className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative"
        >
          {submitted ? (
            <div className="text-center py-6 space-y-8">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-white italic lowercase">Transmission Successful</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  If <span className="text-indigo-400 font-bold">{email}</span> is recognized by our nodes, an encrypted reset protocol has been dispatched.
                </p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setEmail(""); }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Retry Dispatch
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Registered ID</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 text-white placeholder-slate-600 border border-white/5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initiate Reset Protocol
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>

        <div className="mt-10 text-center">
          <a href="/auth/login" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all border-b border-transparent hover:border-white/20">
            Return to Login Terminal
          </a>
        </div>
      </motion.div>
    </div>
  );
}
