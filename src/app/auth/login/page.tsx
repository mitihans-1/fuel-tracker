"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email) {
      setError("Please enter your email address.");
      return;
    }
    if (!form.password) {
     setError("Please enter your password.");
      return;
    }
    if (!verified) {
      setError("Please confirm the security checkbox before signing in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setLoading(false);
        return;
      }

      if (res.ok) {
       window.location.href = "/dashboard";
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex items-start sm:items-center justify-center py-10 px-4 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 relative">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white text-3xl mb-4 shadow-xl shadow-blue-500/30">
            ⛽
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">
            Welcome back
          </h2>
          <p className="text-blue-100/70 font-medium italic">
            Sign in to your FuelSync account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Email Address
              </label>
              <input
              title="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <p className="mt-1 text-[11px] text-blue-200/70">
                Enter your registered email address.
              </p>
            </div>

            <div>
              <label className="text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Password
              </label>
              <input
              title="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              <p className="mt-1 text-[11px] text-blue-200/70">
                Minimum 8 characters required.
              </p>
              <div className="flex justify-end mt-1">
                <Link href="/auth/forgot-password" className="text-[11px] text-blue-300 hover:text-white hover:underline transition-colors font-semibold">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <input
              id="login-verify"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
              required
            />
            <label
              htmlFor="login-verify"
              className="text-[11px] text-blue-100/80"
            >
              I confirm that I am authorised to access this account on this device.
            </label>
          </div>
          {error && (
               <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
               {error}
             </div>
           )}
          <div className="flex flex-col items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={` cursor-pointer w-48 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${loading
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.8)]"
                  }`}
              >
                {loading ? "Authenticating..." : "✦ Sign In"}
              </button>
            </div>


          <div className="pt-4 text-center">
            <p className="text-xs font-bold text-green-300/70 uppercase tracking-widest flex items-center justify-center gap-2">
              🔒 Secure & Encrypted Connection
            </p>

          </div>
        </form>
<div className="relative flex items-center justify-center gap-4 mt-2">
  <div className="flex-1 h-px bg-white/10" />
  <span className="text-xs text-blue-200/40 font-bold uppercase tracking-widest">or</span>
  <div className="flex-1 h-px bg-white/10" />
</div>

<div className="flex justify-center mt-2">
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        alert(data.error || "Google sign-in failed");
      }
    }}
    onError={() => alert("Google sign-in failed")}
    theme="filled_black"
    shape="pill"
    text="signin_with"
  />
</div>
        <p className="text-center text-sm font-bold text-blue-200/60 mt-8">
          New to FuelSync?{" "}
          <Link href="/auth/register" className="text-blue-300 hover:text-white hover:underline transition-colors">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}