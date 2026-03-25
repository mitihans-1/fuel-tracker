"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const labelClass =
    "text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent";
  const inputClass =
    "w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none";

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

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex items-start sm:items-center justify-center py-10 px-4 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 relative">
      {/* Glow blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white text-3xl mb-4 shadow-xl shadow-blue-500/30">
            🔑
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">
            Forgot Password
          </h2>
          <p className="text-blue-100/70 font-medium italic">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-4xl mx-auto">
                ✉️
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Check your inbox</h3>
                <p className="text-blue-100/60 text-sm leading-relaxed">
                  If an account exists for{" "}
                  <span className="text-blue-300 font-bold">{email}</span>, a
                  password reset link has been sent. The link expires in{" "}
                  <span className="text-white font-bold">1 hour</span>.
                </p>
                <p className="text-blue-100/40 text-xs mt-3">
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
              </div>
              <button
                onClick={() => { setSubmitted(false); setEmail(""); }}
                className="cursor-pointer w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 bg-white/10 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
              >
                Try a Different Email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  title="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-blue-200/70">
                  Enter the email address linked to your FuelSync account.
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
                  {error}
                </div>
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
                  {loading ? "Sending..." : "✦ Send Reset Link"}
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs font-bold text-green-300/70 uppercase tracking-widest flex items-center justify-center gap-2">
                  🔒 Secure & Encrypted Connection
                </p>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm font-bold text-blue-200/60 mt-8">
          Remembered your password?{" "}
          <Link
            href="/auth/login"
            className="text-blue-300 hover:text-white hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
