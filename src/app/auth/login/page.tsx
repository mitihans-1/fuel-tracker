"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, ArrowRight } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
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

      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const data = await res.json();
        setError(data.message || "Invalid email or password.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">

      {/* CARD (same as register) */}
       <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
            >

        {/* HEADER (same style as register) */}
        <div className="text-center mb-8">
           <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                   <Shield className="text-white w-6 h-6" />
                 </div>
       

          <h2 className="text-2xl font-black text-slate-900">
            Welcome back
          </h2>

          <p className="text-sm text-slate-500">
            Sign in to your account
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-slate-600 font-medium">
              Email address
            </label>

            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />

              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between text-sm">
              <label className="text-sm text-slate-600 font-medium">Password</label>

              <Link
                href="/auth/forgot-password"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />

              <input
                type="password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
               className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* ERROR (same style system as register) */}
          {error && (
            <div className="text-sm p-3 rounded-lg text-red-300 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* BUTTON (same as register) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* DIVIDER (same as register style) */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-sm text-slate-400">
            Or continue with
          </span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        {/* GOOGLE */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (res) => {
              const authRes = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: res.credential }),
                credentials: "include",
              });

              if (authRes.ok) {
                window.location.href = "/dashboard";
              }
            }}
          />
        </div>

        {/* FOOTER */}
        <p  className="text-center text-sm text-slate-500 mt-6">
          Don’t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Sign up
          </Link>
        </p>

      </motion.div>
    </div>
  );
}