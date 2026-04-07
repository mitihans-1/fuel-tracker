"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import ClientNavbar from "@/components/ClientNavbar";
import { Fuel, Truck, Star, ShieldCheck, Clock3, BadgeDollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [petrol, setPetrol] = useState(false);
  const [diesel, setDiesel] = useState(false);
  const [petrolPrice, setPetrolPrice] = useState(80);
  const [dieselPrice, setDieselPrice] = useState(75);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [isStationOwner, setIsStationOwner] = useState(false);

  useEffect(() => {
    const fetchDataForStation = async () => {
      try {
        const statusRes = await fetch("/api/stations/me");
        if (!statusRes.ok) return;

        const data = await statusRes.json();

        if (Array.isArray(data) && data.length > 0) {
          const currentStation = data[0];
          setIsStationOwner(true);
          setPetrol(!!currentStation.petrol);
          setPetrolPrice(currentStation.petrolPrice ?? 80);
          setDiesel(!!currentStation.diesel);
          setDieselPrice(currentStation.dieselPrice ?? 75);
          setAvgRating(currentStation.rating || null);
          setRatingCount(currentStation.ratingCount || 0);
        }
      } catch {}
    };

    if (user) {
      fetchDataForStation();
    }
  }, [user]);

  const handleAction = (path: string) => {
    if (user) {
      // Logged in user goes to dashboard or specific management path
      router.push(isStationOwner ? path : "/dashboard");
    } else {
      // Check if user has been here before
      const isReturning = localStorage.getItem("fuel_sync_returning_user") === "true";
      if (isReturning) {
        router.push("/auth/login");
      } else {
        router.push("/auth/register");
      }
    }
  };

  return (
    <main className="dashboard-root dashboard-shell min-h-screen text-slate-900 bg-slate-50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[140px] rounded-full" />
      </div>

      <ClientNavbar />

      <div className="max-w-7xl mx-auto relative z-10 pt-32 pb-20 px-4 sm:px-6 space-y-12">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Fuel Solutions for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Modern Infrastructure</span>
          </h1>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            FuelSync connects station owners with thousands of drivers, providing real-time inventory tracking, digital queue management, and customer trust signals.
          </p>
          
          {!user && (
            <div className="flex justify-center pt-4">
              <Link href="/auth/register" className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20">
                Start Free Trial
              </Link>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <article className="group pro-surface rounded-[2.5rem] p-8 border border-slate-200/60 hover:border-indigo-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Fuel className="w-7 h-7" />
              </div>
              {user && isStationOwner && (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${petrol ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {petrol ? "Available ✓" : "Out of Stock ✕"}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Premium Petrol</h2>
            <p className="mt-3 text-slate-500 font-medium leading-relaxed">
              Real-time Benzene inventory management for station owners and live availability for private vehicle drivers.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Market</span>
                <span className="text-lg font-black text-slate-900">{isStationOwner ? petrolPrice : "80+"} ETB/L</span>
              </div>
              <button
                onClick={() => handleAction("/dashboard/inventory")}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-xs font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
              >
                {isStationOwner ? "Update Inventory" : "View Near Me"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>

          <article className="group pro-surface rounded-[2.5rem] p-8 border border-slate-200/60 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              {user && isStationOwner && (
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${diesel ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {diesel ? "Available ✓" : "Out of Stock ✕"}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Heavy Diesel</h2>
            <p className="mt-3 text-slate-500 font-medium leading-relaxed">
              Efficient Nafta distribution tracking optimized for commercial fleets, logistics, and heavy transport.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Market</span>
                <span className="text-lg font-black text-slate-900">{isStationOwner ? dieselPrice : "75+"} ETB/L</span>
              </div>
              <button
                onClick={() => handleAction("/dashboard/inventory")}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-xs font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
              >
                {isStationOwner ? "Update Inventory" : "View Near Me"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>

          <article className="group pro-surface rounded-[2.5rem] p-8 border border-slate-200/60 hover:border-amber-500 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Star className="w-7 h-7" />
              </div>
              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                Reputation
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Trust</h2>
            <p className="mt-3 text-slate-500 font-medium leading-relaxed">
              Transparent rating systems that help reliable stations stand out and drivers find the best service quality.
            </p>
            
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Average</p>
                <p className="text-lg font-black text-slate-900">{isStationOwner && avgRating !== null ? avgRating.toFixed(1) : "4.8"} / 5.0</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Verified</p>
                <p className="text-lg font-black text-slate-900">{isStationOwner ? ratingCount : "500+"}</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-500 font-medium italic text-center">
              Verified reviews help build community trust
            </p>
          </article>
        </section>

        <section className="pro-surface rounded-[3rem] p-10 md:p-16 border border-slate-200/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-black text-slate-900 leading-tight">Why Choose FuelSync Platform?</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                We provide the digital backbone for Ethiopia&apos;s fuel distribution. Our platform ensures that fuel availability is no longer a guessing game.
              </p>
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, title: "Secure Transactions", desc: "Digital verification for every fuel request." },
                  { icon: Clock3, title: "Real-time Signals", desc: "Live updates from stations every minute." },
                  { icon: BadgeDollarSign, title: "Transparent Pricing", desc: "Market-accurate pricing across all regions." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-square max-w-md mx-auto">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] rotate-3 opacity-10" />
               <div className="absolute inset-0 bg-white border border-slate-200 rounded-[2.5rem] flex items-center justify-center p-12 text-center">
                  <div className="space-y-4">
                    <div className="text-6xl mb-4">🌍</div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">10,000+</p>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Active Drivers</p>
                    <div className="h-px w-12 bg-slate-200 mx-auto" />
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">150+</p>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Partner Stations</p>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}