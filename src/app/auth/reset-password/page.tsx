"use client";

import React, { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Shield, ArrowRight, CheckCircle2, Activity, AlertCircle } from "lucide-react";

function Req({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 transition-colors ${met ? "text-emerald-400" : "text-slate-800"}`}>
      <div className={`w-1 h-1 rounded-full ${met ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/10"}`} />
      <span className="text-[9px] font-bold uppercase tracking-tighter">{text}</span>
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const reqs = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isStrong = Object.values(reqs).every(Boolean);

  if (!token) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-red-500/20 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white italic">Invalid Protocol Token</h3>
          <p className="text-slate-500 text-xs">The recovery link is missing its authorization token. Termination of sequence required.</p>
        </div>
        <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">
          Request New Link <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-emerald-500/20 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white italic">Cipher Updated</h3>
          <p className="text-slate-400 text-xs">Your system access cipher has been successfully re-established. Redirecting to terminal...</p>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "linear" }}
            className="h-full bg-indigo-500"
          />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!isStrong) { setError("Security protocol failure: Meet all requirements."); return; }
    if (password !== confirm) { setError("Validation error: Cipher mismatch."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update protocol.");
      }
    } catch {
      setError("System relay failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">New Access Cipher</label>
        <div className="relative group">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 text-white placeholder-slate-600 border border-white/5 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <Req met={reqs.length} text="8+ CHARS" />
          <Req met={reqs.hasUpper} text="UPPERCASE" />
          <Req met={reqs.hasLower} text="LOWERCASE" />
          <Req met={reqs.hasNumber} text="NUMBER" />
          <Req met={reqs.hasSpecial} text="SYMBOL" />
          <div className="flex items-center gap-2">
            <Activity className={`w-3 h-3 ${isStrong ? "text-emerald-500" : "text-slate-800"}`} />
            <span className="text-[8px] font-black uppercase text-slate-600">STRENGTH</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Confirm Cipher</label>
        <div className="relative group">
          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          <>Apply New Cipher <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}

export default function ResetPassword() {
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
            <Shield className="w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Cipher Overwrite</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Configure new access credentials</p>
        </div>

        <Suspense fallback={
          <div className="bg-slate-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 text-center text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">
            Syncing...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-10 text-center">
          <a href="/auth/login" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all border-b border-transparent hover:border-white/20">
            Return to Login Terminal
          </a>
        </div>
      </motion.div>
    </div>
  );
}
