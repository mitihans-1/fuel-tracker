"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [petrol, setPetrol] = useState(false);
  const [diesel, setDiesel] = useState(false);
  const [petrolQty, setPetrolQty] = useState(0);
  const [dieselQty, setDieselQty] = useState(0);
  const [petrolPrice, setPetrolPrice] = useState(80);
  const [dieselPrice, setDieselPrice] = useState(75);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  const refreshData = useCallback(async () => {
    try {
      const statusRes = await fetch("/api/stations/me");
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const currentStation = data[0];
          if (currentStation) {
            setPetrol(!!currentStation.petrol);
            setPetrolQty(currentStation.petrolQty ?? 0);
            setPetrolPrice(currentStation.petrolPrice ?? 80);
            setDiesel(!!currentStation.diesel);
            setDieselQty(currentStation.dieselQty ?? 0);
            setDieselPrice(currentStation.dieselPrice ?? 75);
            setAvgRating(currentStation.rating || null);
            setRatingCount(currentStation.ratingCount || 0);
          }
        } else if (!Array.isArray(data) && !data.error) {
           setPetrol(!!data.petrol);
           setPetrolQty(data.petrolQty ?? 0);
           setPetrolPrice(data.petrolPrice ?? 80);
           setDiesel(!!data.diesel);
           setDieselQty(data.dieselQty ?? 0);
           setDieselPrice(data.dieselPrice ?? 75);
           setAvgRating(data.rating || null);
           setRatingCount(data.ratingCount || 0);
        }
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (user !== null && user.role !== "STATION") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "STATION") refreshData();
  }, [refreshData, user]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm mb-2">Live Products</h1>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Monitor your station's active fuel lineup and reputation</p>
        </div>

        {/* MASSIVE INVENTORY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-10">
          <div 
            className={`flex flex-col justify-between gap-6 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 group`}
            style={{ 
              background: petrol ? "linear-gradient(135deg, rgba(6,78,59,0.3) 0%, rgba(2,6,23,0.6) 100%)" : "linear-gradient(135deg, rgba(127,29,29,0.3) 0%, rgba(2,6,23,0.6) 100%)",
              boxShadow: petrol ? "0 10px 40px rgba(16,185,129,0.15), 0 2px 10px rgba(0,0,0,0.5)" : "0 10px 40px rgba(239,68,68,0.15), 0 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full opacity-30 pointer-events-none transition-all group-hover:opacity-50 ${petrol ? "bg-emerald-500" : "bg-red-500"}`} />
            
            <div className="relative z-10 flex items-start justify-between">
               <div 
                 className={`w-20 h-20 flex items-center justify-center rounded-3xl text-4xl shadow-inner`}
                 style={{ 
                   background: petrol ? "linear-gradient(135deg, #10b981, #047857)" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                   boxShadow: petrol ? "0 4px 15px rgba(16,185,129,0.4)" : "0 4px 15px rgba(239,68,68,0.4)"
                 }}
               >
                 ⛽
               </div>
               <span 
                 className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest`}
                 style={{ 
                   background: petrol ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                   color: petrol ? "#34d399" : "#f87171",
                   boxShadow: petrol ? "inset 0 0 10px rgba(16,185,129,0.1)" : "inset 0 0 10px rgba(239,68,68,0.1)"
                 }}
               >
                 {petrol ? "Available" : "Out of Stock"}
               </span>
            </div>

            <div className="z-10 relative mt-4">
              <p className="text-sm uppercase font-black tracking-widest text-slate-400 mb-2">Premium Petrol</p>
              <div className="flex items-end gap-3">
                <p className={`font-black text-6xl tracking-tighter ${petrol ? "text-emerald-400 drop-shadow-md" : "text-red-400"}`}>{petrol ? `${petrolQty}` : "0"}</p>
                <p className="text-2xl font-bold text-slate-500 mb-1">Litres</p>
              </div>
            </div>

            <div className="z-10 relative pt-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                 <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Current Price</p>
                 <p className="text-xl font-bold text-white">{petrolPrice} <span className="text-sm text-slate-400">ETB/L</span></p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/inventory")} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
              >
                Update Stock
              </button>
            </div>
          </div>

          <div 
            className={`flex flex-col justify-between gap-6 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 group`}
            style={{ 
              background: diesel ? "linear-gradient(135deg, rgba(6,78,59,0.3) 0%, rgba(2,6,23,0.6) 100%)" : "linear-gradient(135deg, rgba(127,29,29,0.3) 0%, rgba(2,6,23,0.6) 100%)",
              boxShadow: diesel ? "0 10px 40px rgba(16,185,129,0.15), 0 2px 10px rgba(0,0,0,0.5)" : "0 10px 40px rgba(239,68,68,0.15), 0 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full opacity-30 pointer-events-none transition-all group-hover:opacity-50 ${diesel ? "bg-emerald-500" : "bg-red-500"}`} />
            
            <div className="relative z-10 flex items-start justify-between">
               <div 
                 className={`w-20 h-20 flex items-center justify-center rounded-3xl text-4xl shadow-inner`}
                 style={{ 
                   background: diesel ? "linear-gradient(135deg, #10b981, #047857)" : "linear-gradient(135deg, #ef4444, #b91c1c)",
                   boxShadow: diesel ? "0 4px 15px rgba(16,185,129,0.4)" : "0 4px 15px rgba(239,68,68,0.4)"
                 }}
               >
                 🚛
               </div>
               <span 
                 className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest`}
                 style={{ 
                   background: diesel ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                   color: diesel ? "#34d399" : "#f87171",
                   boxShadow: diesel ? "inset 0 0 10px rgba(16,185,129,0.1)" : "inset 0 0 10px rgba(239,68,68,0.1)"
                 }}
               >
                 {diesel ? "Available" : "Out of Stock"}
               </span>
            </div>

            <div className="z-10 relative mt-4">
              <p className="text-sm uppercase font-black tracking-widest text-slate-400 mb-2">Heavy Diesel</p>
              <div className="flex items-end gap-3">
                <p className={`font-black text-6xl tracking-tighter ${diesel ? "text-emerald-400 drop-shadow-md" : "text-red-400"}`}>{diesel ? `${dieselQty}` : "0"}</p>
                <p className="text-2xl font-bold text-slate-500 mb-1">Litres</p>
              </div>
            </div>

            <div className="z-10 relative pt-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                 <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Current Price</p>
                 <p className="text-xl font-bold text-white">{dieselPrice} <span className="text-sm text-slate-400">ETB/L</span></p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/inventory")} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
              >
                Update Stock
              </button>
            </div>
          </div>

          <div 
            className="flex flex-col justify-between gap-6 p-8 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 group"
            style={{ 
              background: "linear-gradient(135deg, rgba(146,64,14,0.3) 0%, rgba(2,6,23,0.6) 100%)",
              boxShadow: "0 10px 40px rgba(245,158,11,0.15), 0 2px 10px rgba(0,0,0,0.5)"
            }}
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full opacity-30 pointer-events-none transition-all group-hover:opacity-50 bg-amber-500" />
            
            <div className="relative z-10 flex items-start justify-between">
               <div 
                 className="w-20 h-20 flex items-center justify-center rounded-3xl text-4xl shadow-inner"
                 style={{ 
                   background: "linear-gradient(135deg, #f59e0b, #d97706)",
                   boxShadow: "0 4px 15px rgba(245,158,11,0.4)"
                 }}
               >
                 ⭐
               </div>
               <span 
                 className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                 style={{ 
                   background: "rgba(245,158,11,0.1)",
                   color: "#fbbf24",
                   boxShadow: "inset 0 0 10px rgba(245,158,11,0.1)"
                 }}
               >
                 Reputation
               </span>
            </div>

            <div className="z-10 relative mt-4">
              <p className="text-sm uppercase font-black tracking-widest text-slate-400 mb-2">Customer Rating</p>
              <div className="flex items-end gap-3">
                <p className="font-black text-6xl tracking-tighter text-amber-400 drop-shadow-md">
                   {avgRating !== null ? avgRating.toFixed(1) : "—"}
                </p>
                <p className="text-2xl font-bold text-slate-500 mb-1">/ 5.0</p>
              </div>
            </div>

            <div className="z-10 relative pt-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                 <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Total Reviews</p>
                 <p className="text-xl font-bold text-white">{ratingCount} <span className="text-sm text-slate-400">Feedbacks</span></p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
