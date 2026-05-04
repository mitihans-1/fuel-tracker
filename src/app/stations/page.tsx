"use client";

import ClientNavbar from "@/components/ClientNavbar";
import Link from "next/link";
import { Layout, Link as LinkIcon, Layers, Monitor, Fuel, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StationPortalPage() {
  const features = [
    {
      icon: <Layers className="w-8 h-8 text-blue-600" />,
      title: "Tactical Inventory",
      desc: "Stop estimation. Track your diesel and petrol stock intensities with sub-liter precision.",
      color: "blue"
    },
    {
      icon: <Layout className="w-8 h-8 text-indigo-600" />,
      title: "Queue Orchestration",
      desc: "Prevent site congestion through digital orchestration and wait-time telemetry.",
      color: "indigo"
    },
    {
      icon: <LinkIcon className="w-8 h-8 text-emerald-600" />,
      title: "Unified Payments",
      desc: "Execute frictionless transactions via integrated mobile gateways for rapid verification.",
      color: "emerald"
    },
    {
      icon: <Monitor className="w-8 h-8 text-amber-600" />,
      title: "Grid Analytics",
      desc: "Analyze peak demand cycles and revenue trends through your command center dashboard.",
      color: "amber"
    }
  ];

  return (
    <main className="min-h-screen text-slate-900 bg-white selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      <ClientNavbar />

      <div className="relative z-10 pt-28 pb-24 max-w-6xl mx-auto px-6 space-y-24">

        {/* HERO */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Monitor className="w-3.5 h-3.5" />
            Station Command Portal
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            Modernize Your <br />
            <span className="text-indigo-600">Infrastructure</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            Synchronize your site with the FuelSync Grid to eliminate congestion and drive professional revenue growth.
          </p>
        </section>

        {/* ONBOARDING STEPS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Site Verification", desc: "Register your station and verify ownership credentials." },
            { step: "02", title: "Node Setup", desc: "Configure your local station hardware with the sync key." },
            { step: "03", title: "Live Sync", desc: "Broadcast availability to thousands of active drivers." }
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] bg-slate-50 border border-slate-200 shadow-sm space-y-4"
            >
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol Step {s.step}</span>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">{s.title}</h4>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* FEATURES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((f, i) => (
             <motion.div 
               key={i} 
               whileHover={{ y: -5 }}
               className="group relative bg-slate-50 border border-slate-200 p-12 rounded-[3rem] hover:shadow-2xl transition-all duration-500 overflow-hidden"
             >
               <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${f.color}-500/5 blur-[60px] rounded-full pointer-events-none`} />
               
               <div className="w-16 h-16 mb-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                 {f.icon}
               </div>
               <h3 className="text-2xl font-black mb-5 text-slate-900 tracking-tight">{f.title}</h3>
               <p className="text-slate-600 font-medium leading-relaxed text-lg max-w-sm">
                 {f.desc}
               </p>
               <div className={`mt-10 h-1.5 w-12 bg-slate-200 group-hover:w-24 group-hover:bg-indigo-600 transition-all duration-500 rounded-full`} />
             </motion.div>
          ))}
        </section>

        {/* INITIALIZE SECTION */}
        <section className="p-12 md:p-20 rounded-[4rem] bg-indigo-600 text-white relative overflow-hidden text-center shadow-2xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="max-w-2xl mx-auto space-y-10 relative z-10">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Initialize Your Node
            </h2>
            <p className="text-indigo-100 font-medium text-xl leading-relaxed">
              Deployment takes less than 120 seconds. Join the network today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Link 
                href="/auth/register" 
                className="px-10 py-5 bg-white text-indigo-600 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-2"
              >
                Start Deployment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/contact" 
                className="px-10 py-5 bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-400 transition-all border border-indigo-400 active:scale-95"
              >
                Contact Command
              </Link>
            </div>
          </div>
        </section>

        {/* BOTTOM BAR */}
        <div className="flex justify-between items-center opacity-30 px-6">
           <div className="flex items-center gap-6">
              <Zap className="w-5 h-5 text-indigo-600" />
              <div className="w-16 h-1.5 bg-slate-100 rounded-full" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Global Grid Ready</p>
           <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>

      </div>
    </main>
  );
}

