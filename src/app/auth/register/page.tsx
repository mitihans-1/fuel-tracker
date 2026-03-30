"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, User, Mail, Lock, ArrowRight } from "lucide-react";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordRequirements = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isPasswordStrong) {
      setError("Password does not meet requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccessMessage("Account created successfully. Redirecting...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
      >

        {/* HEADER */}
        <div className="text-center mb-8 space-y-3">

          <div className="w-12 h-12 mx-auto bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="text-white w-6 h-6" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">
            Create your account
          </h2>

          <p className="text-sm text-slate-500">
            Start using the platform in seconds
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="text-sm text-slate-600 font-medium">
              Full name
            </label>

            <div className="relative mt-1">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-slate-600 font-medium">
              Email address
            </label>

            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-slate-600 font-medium">
              Password
            </label>

            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {/* PASSWORD RULES */}
            <div className="mt-3 text-xs space-y-1">
              <p className={passwordRequirements.length ? "text-emerald-500" : "text-slate-400"}>
                • At least 8 characters
              </p>
              <p className={passwordRequirements.upper ? "text-emerald-500" : "text-slate-400"}>
                • One uppercase letter
              </p>
              <p className={passwordRequirements.lower ? "text-emerald-500" : "text-slate-400"}>
                • One lowercase letter
              </p>
              <p className={passwordRequirements.number ? "text-emerald-500" : "text-slate-400"}>
                • One number
              </p>
            </div>
          </div>

          {/* ERROR / SUCCESS */}
          {(error || successMessage) && (
            <div
              className={`text-sm p-3 rounded-xl border ${
                error
                  ? "text-red-500 bg-red-50 border-red-200"
                  : "text-emerald-600 bg-emerald-50 border-emerald-200"
              }`}
            >
              {error || successMessage}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}