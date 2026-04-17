"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";


// ─── Shared styles ─────────────────────────────────────────────────────────────
const labelClass =
  "text-[10px] font-black uppercase tracking-[0.2em] ml-5 mb-2 block text-slate-500";
const inputClass =
  "w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-md text-slate-900 placeholder-slate-400 border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none disabled:opacity-40 shadow-sm font-semibold";

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${met ? "text-emerald-600" : "text-slate-400"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-emerald-500" : "bg-slate-300"}`} />
      {text}
    </div>
  );
}

function StatusBanner({ status, message }: { status: "success" | "error" | null; message: string }) {
  if (!status) return null;
  return (
    <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
      status === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
        : "bg-red-50 border border-red-200 text-red-800"
    }`}>
      {status === "success" ? "✓ " : ""}{message}
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="pro-card p-8 space-y-8 bg-white/50">
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200/50">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl flex items-center justify-center text-xl shadow-inner">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Configuration Active</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Profile panel ─────────────────────────────────────────────────────────────
function ProfilePanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/settings")
      .then((r) => r.json())
      .then((d) => {
        setName(d.name ?? "");
        setEmail(d.email ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "profile", name, email }),
      });
      const data = await res.json();
      setStatus(res.ok ? "success" : "error");
      setMessage(data.message || (res.ok ? "Profile updated." : "Something went wrong."));
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Profile Information" icon="👤">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Full Name</label>
          <input
            title="name"
            type="text"
            required
            disabled={loading}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Shown to other users across the platform.
          </p>
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <input
            title="email"
            type="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Used for login and account notifications.
          </p>
        </div>

        <StatusBanner status={status} message={message} />

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving || loading}
            className={`cursor-pointer px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 ${
              saving || loading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-900/20"
            }`}
          >
            {saving ? "Processing…" : "Save Terminal Profile"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Password panel ────────────────────────────────────────────────────────────
function PasswordPanel() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");

  const reqs = {
    length: newPw.length >= 8,
    hasUpper: /[A-Z]/.test(newPw),
    hasLower: /[a-z]/.test(newPw),
    hasNumber: /[0-9]/.test(newPw),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPw),
  };
  const isStrong = Object.values(reqs).every(Boolean);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!isStrong) {
      setStatus("error");
      setMessage("Please meet all password requirements.");
      return;
    }
    if (newPw !== confirm) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      setStatus(res.ok ? "success" : "error");
      setMessage(data.message || (res.ok ? "Password changed." : "Something went wrong."));
      if (res.ok) {
        setCurrent("");
        setNewPw("");
        setConfirm("");
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Change Password" icon="🔐">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Current Password</label>
          <input
            title="current"
            type="password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>New Password</label>
          <input
            title="new-password"
            type="password"
            required
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className={`${inputClass} ${newPw && !isStrong ? "border-red-500/50" : ""}`}
          />
          <div className="mt-3 grid grid-cols-2 gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Requirement met={reqs.length} text="8+ Characters" />
            <Requirement met={reqs.hasUpper} text="Uppercase (A-Z)" />
            <Requirement met={reqs.hasLower} text="Lowercase (a-z)" />
            <Requirement met={reqs.hasNumber} text="Number (0-9)" />
            <Requirement met={reqs.hasSpecial} text="Special Character" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Confirm New Password</label>
          <input
            title="confirm"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`${inputClass} ${confirm && confirm !== newPw ? "border-red-500/50" : ""}`}
          />
          {confirm && confirm !== newPw && (
            <p className="mt-1 text-[11px] text-red-600 font-semibold ml-1">Passwords do not match.</p>
          )}
        </div>

        <StatusBanner status={status} message={message} />

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className={`cursor-pointer px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 ${
              saving
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-600/20"
            }`}
          >
            {saving ? "Syncing…" : "Update Security Credentials"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <p className="text-slate-500 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  const roleLabel =
    user?.role === "DRIVER" ? "Driver" : user?.role === "STATION" ? "Station Owner" : "Administrator";

  return (
    <div className="relative">
      <div className="relative z-10 max-w-4xl mx-auto pb-20">
        <div className="space-y-8">
          <ProfilePanel />
          <PasswordPanel />
        </div>

        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-2 mt-10">
          🔒 Secure & Encrypted Connection
        </p>
      </div>
    </div>
  );
}
