"use client";

import React from "react";
import ClientNavbar from "@/components/ClientNavbar";
import { 
  Fuel, 
  Truck, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  BarChart3,
  ArrowRight,
  Zap,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductsCatalogPage() {
  const petrolProducts = [
    {
      id: "p1",
      name: "Super Premium 98",
      price: "85.50",
      image: "https://images.pexels.com/photos/38271/pumping-gas-gas-station-gas-pump-fuel-38271.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Highest octane rating for maximum engine performance and cleaner combustion.",
      features: ["Octane 98", "Engine Cleaning", "Anti-Knock"]
    },
    {
      id: "p2",
      name: "Premium Unleaded 95",
      price: "82.20",
      image: "https://images.pexels.com/photos/1703312/pexels-photo-1703312.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Optimal balance of power and efficiency for modern passenger vehicles.",
      features: ["Octane 95", "Fuel Economy", "Standard Grade"]
    },
    {
      id: "p3",
      name: "Eco-Plus Petrol",
      price: "81.50",
      image: "https://images.pexels.com/photos/257850/pexels-photo-257850.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Reduced emission formula optimized for hybrid and small-engine urban cars.",
      features: ["Low Carbon", "High MPG", "Hybrid Ready"]
    },
    {
      id: "p4",
      name: "Standard Petrol",
      price: "79.80",
      image: "https://images.pexels.com/photos/979602/pexels-photo-979602.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Reliable, high-quality fuel for daily commuting and older vehicle models.",
      features: ["Octane 91", "Cost Effective", "Pure Distillate"]
    }
  ];

  const dieselProducts = [
    {
      id: "d1",
      name: "Euro 6 Ultra Diesel",
      price: "78.90",
      image: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Ultra-low sulfur formula designed for the latest heavy-duty Euro 6 engines.",
      features: ["Ultra Low Sulfur", "Particulate Filter Safe", "High Torque"]
    },
    {
      id: "d2",
      name: "High-Performance Diesel",
      price: "76.50",
      image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Enhanced cetane rating for better ignition and power in commercial trucks.",
      features: ["High Cetane", "Cold Start Optimized", "Heavy Load"]
    },
    {
      id: "d3",
      name: "Bio-Diesel Blend",
      price: "75.20",
      image: "https://images.pexels.com/photos/163726/belgium-antwerp-gas-station-fuel-163726.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Sustainable energy blend reducing reliance on traditional fossil distillates.",
      features: ["Eco-Friendly", "Renewable Source", "Clean Exhaust"]
    },
    {
      id: "d4",
      name: "Standard Nafta",
      price: "73.80",
      image: "https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg?auto=compress&cs=tinysrgb&w=800",
      desc: "Standard commercial diesel for transport logistics and industrial machinery.",
      features: ["Standard Grade", "High Volume", "Reliable"]
    }
  ];

  return (
    <main className="min-h-screen text-slate-900 bg-white selection:bg-indigo-500/30">
      {/* Subtle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[140px] rounded-full" />
      </div>

      <ClientNavbar />

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-24">
        
        {/* Header */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            Digital Fuel Inventory
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]"
          >
            Fuel <span className="text-indigo-600">Solutions</span> Catalog
          </motion.h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Explore our professionally tracked fuel categories. From premium performance 
            to sustainable energy, we ensure digital transparency for every refill.
          </p>
        </section>

        {/* Petrol Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Petrol (Benzene)</h2>
              <p className="text-sm text-slate-500 font-medium italic">Premium spark-ignition solutions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {petrolProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -8 }}
                className="group flex flex-col bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 text-indigo-600 font-black text-sm shadow-sm">
                    {product.price} <span className="text-[10px]">ETB/L</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1">
                    {product.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((f) => (
                      <span key={f} className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider">
                        {f}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href="/dashboard"
                    className="w-full py-3.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/30"
                  >
                    Order Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Diesel Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Diesel (Nafta)</h2>
              <p className="text-sm text-slate-500 font-medium italic">High-torque compression solutions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dieselProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -8 }}
                className="group flex flex-col bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-white/20 text-blue-600 font-black text-sm shadow-sm">
                    {product.price} <span className="text-[10px]">ETB/L</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1">
                    {product.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.features.map((f) => (
                      <span key={f} className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider">
                        {f}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href="/dashboard"
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/30"
                  >
                    Order Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-[3rem] p-12 md:p-20 bg-slate-900 text-white relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Fueling the Future of <br /> 
              <span className="text-indigo-400">Digital Logistics</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">
              Our platform ensures that you have access to the highest quality fuel 
              with the convenience of digital tracking and secure payments.
            </p>
            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
