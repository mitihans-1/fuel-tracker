"use client"
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [stationName, setStationName] = useState("");
  const [stationLocation, setStationLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordRequirements = {
    length: form.password.length >= 8,
    hasUpper: /[A-Z]/.test(form.password),
    hasLower: /[a-z]/.test(form.password),
    hasNumber: /[0-9]/.test(form.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role || !verified) return;
    if (form.role === "STATION" && (!stationName || !stationLocation)) return;

    if (!isPasswordStrong) {
      alert("Please ensure your password meets all the security requirements.");
      return;
    }

    setLoading(true);
    try {
      // Build payload: include station fields only when role is STATION
      const payload: Record<string, unknown> = { ...form };
      if (form.role === "STATION") {
        payload.stationName = stationName;
        payload.stationLocation = stationLocation;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setSuccessMessage(data.message || "Account created successfully! Please check your email to verify your account.");
      setTimeout(() => router.push("/auth/login"), 3500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent";
  const inputClass =
    "w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none";

  return (
    <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex items-start sm:items-center justify-center py-10 px-4 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 relative">
      {/* Glow blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white text-3xl mb-4 shadow-xl shadow-blue-500/30">
            ⛽
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">Create Your Account</h2>
          <p className="text-blue-100/70 font-medium italic">Join drivers and stations on FuelSync today</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-5">
          {/* Full Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              title="name"
              name="name"
              type="text"
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <p className="mt-1 text-[11px] text-blue-200/70">
              Your display name as shown to stations and administrators.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              title="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-blue-200/70">
              Used for login, notifications, and account recovery.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>Password</label>
            <input
              title="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className={`${inputClass} ${form.password && !isPasswordStrong ? "border-red-500/50" : ""}`}
            />
            
            {/* Password Requirements Checklist */}
            <div className="mt-3 grid grid-cols-2 gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <Requirement met={passwordRequirements.length} text="8+ Characters" />
              <Requirement met={passwordRequirements.hasUpper} text="Uppercase (A-Z)" />
              <Requirement met={passwordRequirements.hasLower} text="Lowercase (a-z)" />
              <Requirement met={passwordRequirements.hasNumber} text="Number (0-9)" />
              <Requirement met={passwordRequirements.hasSpecial} text="Special Character" />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className={labelClass}>Account Type</label>
            <select
              title="role"
              name="role"
              required
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="" className="bg-slate-800">
                Select your role
              </option>
              <option value="DRIVER" className="bg-slate-800">
                🚗 Driver
              </option>
              <option value="STATION" className="bg-slate-800">
                ⛽ Fuel Station
              </option>
            </select>
            <p className="mt-1 text-[11px] text-blue-200/70">
              Select your role to personalise your dashboard experience.
            </p>
          </div>

          {/* Station fields (shown only for STATION role) */}
          {form.role === "STATION" && (
            <>
              <div>
                <label className={labelClass}>Station Name</label>
                <input
                  title="stationName"
                  name="stationName"
                  type="text"
                  required
                  placeholder="e.g. Central Fuel Depot"
                  className={inputClass}
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-blue-200/70">
                  This is how drivers will see your station in the app.
                </p>
              </div>

              <div>
                <label className={labelClass}>Station Location</label>
                <input
                  title="stationLocation"
                  name="stationLocation"
                  type="text"
                  required
                  placeholder="Address or coordinates"
                  className={inputClass}
                  value={stationLocation}
                  onChange={(e) => setStationLocation(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-blue-200/70">
                  Provide a clear address or area so drivers can find you easily.
                </p>
              </div>
            </>
          )}

          {/* Verification */}
          <div className="pt-2 flex items-start gap-2">
            <input
              id="register-verify"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-500"
              required
            />
            <label
              htmlFor="register-verify"
              className="text-[11px] text-blue-100/80"
            >
              I confirm the details above are accurate and agree to use FuelSync responsibly.
            </label>
          </div>
            {successMessage && (
              <div className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium">
                ✓ {successMessage}
              </div>
            )}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}
          {/* Submit Button */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading || !verified}
              className={`cursor-pointer w-56 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${
                loading
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.8)]"
              }`}
            >
              {loading ? "Creating Account..." : "✦ Create Account"}
            </button>
          </div>

          {/* Security note */}
          <div className="pt-2 text-center">
            <p className="text-xs font-bold text-green-300/70 uppercase tracking-widest flex items-center justify-center gap-2">
              🔒 Secure & Encrypted Connection
            </p>
          </div>
        </form>

        {/* Login link */}
        <p className="text-center text-sm font-bold text-blue-200/60 mt-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-300 hover:text-white hover:underline transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${met ? "text-emerald-400" : "text-white/30"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-white/20"}`} />
      {text}
    </div>
  );
}