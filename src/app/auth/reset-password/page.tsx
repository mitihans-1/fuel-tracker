"use client";

import React, { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${met ? "text-emerald-400" : "text-white/30"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-white/20"}`} />
      {text}
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

  const labelClass =
    "text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent";
  const inputClass =
    "w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none";

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
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-xl font-black text-white">Invalid Reset Link</h3>
        <p className="text-blue-100/60 text-sm">This link is missing a reset token. Please request a new one.</p>
        <Link href="/auth/forgot-password" className="inline-block mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all duration-300 shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]">
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-4xl mx-auto">✅</div>
        <h3 className="text-xl font-black text-white">Password Reset!</h3>
        <p className="text-blue-100/60 text-sm">Your password has been updated. Redirecting you to sign in…</p>
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!isStrong) { setError("Please meet all password requirements."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-5">
      <div>
        <label className={labelClass}>New Password</label>
        <input
          title="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} ${password && !isStrong ? "border-red-500/50" : ""}`}
        />
        <div className="mt-3 grid grid-cols-2 gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
          <Requirement met={reqs.length} text="8+ Characters" />
          <Requirement met={reqs.hasUpper} text="Uppercase (A-Z)" />
          <Requirement met={reqs.hasLower} text="Lowercase (a-z)" />
          <Requirement met={reqs.hasNumber} text="Number (0-9)" />
          <Requirement met={reqs.hasSpecial} text="Special Character" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Confirm Password</label>
        <input
          title="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={`${inputClass} ${confirm && confirm !== password ? "border-red-500/50" : ""}`}
        />
        {confirm && confirm !== password && (
          <p className="mt-1 text-[11px] text-red-400/80 font-semibold ml-1">Passwords do not match.</p>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">{error}</div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer w-56 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${
            loading
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.8)]"
          }`}
        >
          {loading ? "Resetting..." : "✦ Reset Password"}
        </button>
      </div>

      <div className="pt-2 text-center">
        <p className="text-xs font-bold text-green-300/70 uppercase tracking-widest flex items-center justify-center gap-2">
          🔒 Secure & Encrypted Connection
        </p>
      </div>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex items-start sm:items-center justify-center py-10 px-4 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 relative">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white text-3xl mb-4 shadow-xl shadow-blue-500/30">
            🔐
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">Reset Password</h2>
          <p className="text-blue-100/70 font-medium italic">Choose a strong new password for your account</p>
        </div>

        <Suspense fallback={
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-center text-blue-200/50 text-sm">
            Loading…
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm font-bold text-blue-200/60 mt-8">
          Back to{" "}
          <Link href="/auth/login" className="text-blue-300 hover:text-white hover:underline transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
