"use client";
import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface Station {
  _id: string;
  ownerUserId: string;
  petrol: boolean;
  diesel: boolean;
  petrolQty: number;
  dieselQty: number;
  petrolPrice: number;
  dieselPrice: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [petrol, setPetrol] = useState(false);
  const [diesel, setDiesel] = useState(false);
  const [petrolQty, setPetrolQty] = useState(0);
  const [dieselQty, setDieselQty] = useState(0);
  const [petrolPrice, setPetrolPrice] = useState(0);
  const [dieselPrice, setDieselPrice] = useState(0);
  const [stationId, setStationId] = useState("");

  const refreshData = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      
      if (meData.role !== "STATION") {
        router.push("/dashboard");
        return;
      }

      const stationRes = await fetch("/api/admin/stations");
      const stations = await stationRes.json();
      
      const myStation = stations.find((s: Station) => s.ownerUserId === meData._id);

      if (myStation) {
        setStationId(myStation._id);
        setPetrol(myStation.petrol);
        setDiesel(myStation.diesel);
        setPetrolQty(myStation.petrolQty || 0);
        setDieselQty(myStation.dieselQty || 0);
        setPetrolPrice(myStation.petrolPrice || 0);
        setDieselPrice(myStation.dieselPrice || 0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [router]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stations/${stationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petrol,
          diesel,
          petrolQty,
          dieselQty,
          petrolPrice,
          dieselPrice,
        }),
      });

      if (res.ok) {
        alert("Inventory updated successfully!");
        refreshData();
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Inventory Management</h1>
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Update your stations live fuel stock and pricing</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/5 shadow-2xl max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            {/* Petrol Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center text-xl">⛽</div>
                <h2 className="text-xl font-black text-white">Petrol Stock</h2>
              </div>
              
              <div className="space-y-4">
               <div>
  <label
    htmlFor="petrolQty"
    className="text-xs font-black uppercase tracking-widest text-white/40 ml-1"
  >
    Quantity (Liters)
  </label>
  <input
    id="petrolQty"
    type="number"
    value={petrolQty}
    onChange={(e) => setPetrolQty(Number(e.target.value))}
    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all text-lg"
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
    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all text-lg"
  />
</div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
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
    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
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
    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
  />
</div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
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

          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.3em] text-sm py-6 rounded-[1.5rem] shadow-2xl shadow-blue-500/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? "Saving Changes..." : "✦ Save Inventory Status"}
          </button>
        </div>
      </div>
    </main>
  );
}