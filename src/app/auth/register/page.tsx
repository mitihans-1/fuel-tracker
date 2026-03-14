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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) return;
    if (form.role === "STATION" && (!stationName || !stationLocation)) return;

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
        const text = await res.text();
        alert(`Registration failed: ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      alert(data.message);
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
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
          <h2 className="text-4xl font-black tracking-tight text-white">Get Started</h2>
          <p className="text-blue-100/70 font-medium italic">Join the digital fuel network today</p>
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
              className={inputClass}
            />
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
              <option value="ADMIN" className="bg-slate-800">
                🛡️ Administrator
              </option>
            </select>
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
              </div>
            </>
          )}

          {/* Submit Button */}
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