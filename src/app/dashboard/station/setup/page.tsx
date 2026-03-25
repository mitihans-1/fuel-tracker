"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDot({ step, current, label }: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm transition-all duration-300 border-2 ${
          done
            ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_16px_rgba(52,211,153,0.4)]"
            : active
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]"
            : "bg-white/5 border-white/15 text-white/30"
        }`}
      >
        {done ? "✓" : step}
      </div>
      <span
        className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
          active ? "text-blue-300" : done ? "text-emerald-400" : "text-white/30"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div className={`flex-1 h-0.5 mt-4 rounded-full transition-all duration-500 ${done ? "bg-emerald-500/60" : "bg-white/10"}`} />
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelClass =
  "text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent";
const inputClass =
  "w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none";

// ─── Toggle button ────────────────────────────────────────────────────────────
function FuelToggle({
  value,
  onChange,
  color,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color: "green" | "blue";
}) {
  const on = color === "green"
    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
    : "bg-blue-500 text-white shadow-lg shadow-blue-500/20";
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <span className="text-xs font-black uppercase tracking-widest text-white/60">
        Available for Sale
      </span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
          value ? on : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}
      >
        {value ? "YES" : "NO"}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function StationSetupPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 1 fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  // Step 2 fields
  const [petrol, setPetrol] = useState(true);
  const [petrolQty, setPetrolQty] = useState(0);
  const [petrolPrice, setPetrolPrice] = useState(80);
  const [diesel, setDiesel] = useState(true);
  const [dieselQty, setDieselQty] = useState(0);
  const [dieselPrice, setDieselPrice] = useState(75);

  // Guard: non-STATION users go back to dashboard
  useEffect(() => {
    if (!userLoading && user && user.role !== "STATION") {
      router.replace("/dashboard");
    }
  }, [user, userLoading, router]);

  // Pre-fill from existing station data (if any)
  useEffect(() => {
    async function prefill() {
      try {
        const res = await fetch("/api/stations/me");
        if (!res.ok) return;
        const data = await res.json();
        if (data.isSetupComplete) {
          router.replace("/dashboard");
          return;
        }
        if (data.name && data.name !== "Station") setName(data.name);
        if (data.location && data.location !== "Unknown") setLocation(data.location);
        if (data.petrolPrice) setPetrolPrice(data.petrolPrice);
        if (data.dieselPrice) setDieselPrice(data.dieselPrice);
      } catch {
        /* silent */
      }
    }
    if (user?.role === "STATION") prefill();
  }, [user, router]);

  const handleStep1 = () => {
    if (!name.trim() || !location.trim()) {
      setError("Please fill in both station name and location.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/stations/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          petrol,
          petrolQty,
          petrolPrice,
          diesel,
          dieselQty,
          dieselPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Setup failed. Please try again.");
        return;
      }
      setStep(3);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-blue-200/50 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex items-start sm:items-center justify-center py-10 px-4 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 relative">
      {/* Glow blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-3xl mb-4 shadow-xl shadow-blue-500/30">
            ⛽
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">Station Setup</h2>
          <p className="text-blue-100/70 font-medium italic">
            Let&apos;s get your station ready in two quick steps
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-start px-2">
            <StepDot step={1} current={step} label="Profile" />
            <StepConnector done={step > 1} />
            <StepDot step={2} current={step} label="Fuel" />
            <StepConnector done={step > 2} />
            <StepDot step={3} current={step} label="Done" />
          </div>
        )}

        {/* ── STEP 1 — Station profile ── */}
        {step === 1 && (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-300/70 mb-5">
                Step 1 — Station Profile
              </p>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Station Name</label>
                  <input
                    title="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Central Fuel Depot"
                    className={inputClass}
                  />
                  <p className="mt-1 text-[11px] text-blue-200/70">
                    This is how drivers will find your station on the map.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Location / Address</label>
                  <input
                    title="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bole Road, Addis Ababa"
                    className={inputClass}
                  />
                  <p className="mt-1 text-[11px] text-blue-200/70">
                    Used to pin your station on the live map for drivers.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleStep1}
                className="cursor-pointer w-56 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]"
              >
                Next → Fuel Setup
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Fuel inventory ── */}
        {step === 2 && (
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-6">
            <p className="text-xs font-black uppercase tracking-widest text-blue-300/70">
              Step 2 — Fuel Inventory
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Petrol */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center text-lg">⛽</div>
                  <h3 className="text-base font-black text-white">Petrol</h3>
                </div>
                <div>
                  <label className={labelClass}>Quantity (L)</label>
                  <input
                    type="number"
                    min={0}
                    value={petrolQty}
                    onChange={(e) => setPetrolQty(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price (ETB/L)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={petrolPrice}
                    onChange={(e) => setPetrolPrice(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <FuelToggle value={petrol} onChange={setPetrol} color="green" />
              </div>

              {/* Diesel */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-lg">🚛</div>
                  <h3 className="text-base font-black text-white">Diesel</h3>
                </div>
                <div>
                  <label className={labelClass}>Quantity (L)</label>
                  <input
                    type="number"
                    min={0}
                    value={dieselQty}
                    onChange={(e) => setDieselQty(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price (ETB/L)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={dieselPrice}
                    onChange={(e) => setDieselPrice(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <FuelToggle value={diesel} onChange={setDiesel} color="blue" />
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setError(""); setStep(1); }}
                className="cursor-pointer flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 bg-white/10 hover:bg-white/15 text-white/60 hover:text-white border border-white/10"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`cursor-pointer flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${
                  submitting
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]"
                }`}
              >
                {submitting ? "Setting up…" : "✦ Complete Setup"}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Success ── */}
        {step === 3 && (
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white/10 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-5xl mx-auto">
              🎉
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">You&apos;re all set!</h3>
              <p className="text-blue-100/60 text-sm leading-relaxed">
                <span className="text-white font-bold">{name}</span> is now live on FuelSync.
                Drivers in your area can see your station and request fuel.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Petrol</p>
                <p className={`font-black ${petrol ? "text-green-400" : "text-red-400"}`}>
                  {petrol ? `${petrolQty} L · ${petrolPrice} ETB` : "Unavailable"}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Diesel</p>
                <p className={`font-black ${diesel ? "text-blue-400" : "text-red-400"}`}>
                  {diesel ? `${dieselQty} L · ${dieselPrice} ETB` : "Unavailable"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.replace("/dashboard")}
              className="cursor-pointer w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]"
            >
              ✦ Go to Dashboard
            </button>
          </div>
        )}

        {/* Security note */}
        {step < 3 && (
          <p className="text-center text-xs font-bold text-green-300/70 uppercase tracking-widest flex items-center justify-center gap-2">
            🔒 Secure & Encrypted Connection
          </p>
        )}
      </div>
    </div>
  );
}
