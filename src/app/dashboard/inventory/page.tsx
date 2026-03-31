"use client";
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [petrol, setPetrol] = useState(false);
  const [diesel, setDiesel] = useState(false);
  const [petrolQty, setPetrolQty] = useState(0);
  const [dieselQty, setDieselQty] = useState(0);
  const [petrolPrice, setPetrolPrice] = useState(0);
  const [dieselPrice, setDieselPrice] = useState(0);
  const [stationId, setStationId] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");


const refreshData = useCallback(async () => {
  try {
    const stationRes = await fetch("/api/stations/me");
    const myStation = await stationRes.json();

    if (myStation && !myStation.error) {
      setStationId(myStation._id);
      setPetrol(myStation.petrol);
      setDiesel(myStation.diesel);
      setPetrolQty(myStation.petrolQty || 0);
      setDieselQty(myStation.dieselQty || 0);
      setPetrolPrice(myStation.petrolPrice || 0);
      setDieselPrice(myStation.dieselPrice || 0);
    }
  } catch {
    // silent — page will display last known values
  }
}, []);

  // Guard: redirect non-STATION users without an extra API call
  useEffect(() => {
    if (user !== null && user.role !== "STATION") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role === "STATION") refreshData();
  }, [refreshData, user]);

  const handleUpdateStatus = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch(`/api/stations/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stationId,
          petrol,
          diesel,
          petrolQty,
          dieselQty,
          petrolPrice,
          dieselPrice,
        }),
      });

      if (res.ok) {
        setStatus("success");
        refreshData();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text selection:bg-primary/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-text mb-2">Inventory Management</h1>
          <p className="text-primary font-bold uppercase tracking-widest text-xs">Update your station&apos;s live fuel stock and pricing</p>
        </div>

        <div 
          className="backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl max-w-4xl relative overflow-hidden"
          style={{ 
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            boxShadow: "0 20px 80px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.05)"
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            {/* Petrol Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center text-xl">⛽</div>
                <h2 className="text-xl font-black text-white">Petrol Stock</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="petrolQty" className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">
                    Quantity (Liters)
                  </label>
                  <input
                    id="petrolQty"
                    type="number"
                    value={petrolQty}
                    onChange={(e) => setPetrolQty(Number(e.target.value))}
                    className="w-full bg-black/40 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-lg shadow-inner"
                    style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  />
                </div>
                <div>
                  <label htmlFor="petrolPrice" className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">
                    Price (ETB per Liter)
                  </label>
                  <input
                    id="petrolPrice"
                    type="number"
                    step="0.01"
                    value={petrolPrice}
                    onChange={(e) => setPetrolPrice(Number(e.target.value))}
                    className="w-full bg-black/40 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-lg shadow-inner"
                    style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl shadow-inner" style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">Available for Sale</span>
                  <button 
                    onClick={() => setPetrol(!petrol)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${petrol ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
                  >
                    {petrol ? "YES" : "NO"}
                  </button>
                </div>
              </div>
            </div>

            {/* Diesel Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-xl">🚛</div>
                <h2 className="text-xl font-black text-white">Diesel Stock</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="dieselQty" className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">
                    Quantity (Liters)
                  </label>
                  <input
                    id="dieselQty"
                    type="number"
                    value={dieselQty}
                    onChange={(e) => setDieselQty(Number(e.target.value))}
                    className="w-full bg-black/40 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg shadow-inner"
                    style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  />
                </div>
                <div>
                  <label htmlFor="dieselPrice" className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">
                    Price (ETB per Liter)
                  </label>
                  <input
                    id="dieselPrice"
                    type="number"
                    step="0.01"
                    value={dieselPrice}
                    onChange={(e) => setDieselPrice(Number(e.target.value))}
                    className="w-full bg-black/40 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg shadow-inner"
                    style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl shadow-inner" style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">Available for Sale</span>
                  <button 
                    onClick={() => setDiesel(!diesel)}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${diesel ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}
                  >
                    {diesel ? "YES" : "NO"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {status === "success" && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-emerald-500/10 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2" style={{ boxShadow: "0 4px 20px rgba(16,185,129,0.1)" }}>
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span> Inventory updated successfully!
            </div>
          )}
          {status === "error" && (
            <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 text-red-300 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2" style={{ boxShadow: "0 4px 20px rgba(239,68,68,0.1)" }}>
              <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">✕</span> Failed to update inventory.
            </div>
          )}

          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50"
            style={{ boxShadow: "0 10px 40px rgba(79,70,229,0.4)" }}
          >
            {loading ? "Updating..." : "Save Status"}
          </button>
        </div>
      </div>
    </main>
  );
}
