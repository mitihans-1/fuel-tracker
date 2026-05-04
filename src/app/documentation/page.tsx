"use client"
import ClientNavbar from "@/components/ClientNavbar";
import { Book, Code, Shield, Activity, Zap, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentationPage() {
  const sections = [
    {
      title: "System Architecture",
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      content: "FuelSync's core protocol is built on a high-concurrency architecture designed to handle thousands of real-time telemetry updates."
    },
    {
      title: "Real-Time Sync Protocol",
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      content: "Our synchronization engine utilizes advanced communication layers to ensure sub-second precision on wait-time metrics."
    },
    {
      title: "Security & Encryption",
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      content: "All transactions and station logs are secured via military-grade encryption, ensuring total fiscal transparency."
    },
    {
      title: "Driver API Integration",
      icon: <Code className="w-6 h-6 text-amber-600" />,
      content: "Fleet managers can integrate directly with our REST API to monitor fuel consumption across large vehicle deployments."
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
            <Zap className="w-3.5 h-3.5" />
            Technical Protocol v4.0
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            System <span className="text-indigo-600">Intelligence</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            Comprehensive integration guidelines and technical specifications for the FuelSync Strategic Grid.
          </p>
        </section>

        {/* QUICK START */}
        <section className="p-10 md:p-12 rounded-[3rem] bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Integrating with the Grid</h2>
            <p className="text-indigo-100 font-medium text-lg max-w-2xl leading-relaxed">
              FuelSync provides a comprehensive set of APIs to synchronize your fuel station or fleet management system with our national grid.
            </p>
            <div className="flex gap-4 pt-4 flex-wrap">
              <button className="px-8 py-4 bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-indigo-50 transition-all shadow-xl">
                Read API Docs
              </button>
              <button className="px-8 py-4 bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl border border-indigo-400 hover:bg-indigo-400 transition-all">
                View Examples
              </button>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 group relative overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                  {section.content}
                </p>
                <div className="mt-8 h-1 w-10 bg-slate-200 group-hover:w-20 group-hover:bg-indigo-600 transition-all duration-300 rounded-full" />
              </div>
            </motion.div>
          ))}
        </section>

        {/* SOP BOX */}
        <section className="p-10 md:p-12 rounded-[3rem] bg-slate-50 border border-slate-200 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Book className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">Operating Manual</h4>
              <p className="text-slate-600 font-medium max-w-xl text-lg leading-relaxed">
                Access the full FuelSync operational manual for station managers and fleet administrators. Includes detailed troubleshooting steps.
              </p>
            </div>
            <button className="px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
              Download Full PDF
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}

