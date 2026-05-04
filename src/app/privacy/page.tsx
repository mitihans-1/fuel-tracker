"use client"
import ClientNavbar from "@/components/ClientNavbar";
import { Lock, Eye, ShieldCheck, Database, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const policies = [
    {
      title: "Data Sovereignty",
      icon: <Database className="w-5 h-5 text-indigo-600" />,
      text: "At FuelSync, we believe your fueling telemetry is yours. All personal data is stored in secure containers, ensuring that granular driver routes remain private."
    },
    {
      title: "Encryption Standards",
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      text: "Every byte of data transmitted between your vehicle and the station grid is encrypted using military-grade protocols. This ensures your payment credentials remain private."
    },
    {
      title: "Zero-Knowledge Monitoring",
      icon: <Eye className="w-5 h-5 text-emerald-600" />,
      text: "Our analytics systems use advanced proofs to monitor station congestion without ever needing to know the identity or specific location of individual drivers."
    }
  ];

  const details = [
    { title: "Information We Collect", content: "We collect minimal telemetry required for synchronization: vehicle type, requested fuel volume, and station node ID." },
    { title: "Data Retention Pulse", content: "Operational telemetry is automatically purged from our buffers every 72 hours. Aggregate logs are anonymized for national grid analytics." },
    { title: "Your Access Rights", content: "Drivers and station owners maintain full sovereignty over their data. You may request a complete export or permanent deletion at any time." }
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
            <Globe className="w-3.5 h-3.5" />
            Security Compliance v2.6
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            Privacy <span className="text-indigo-600">Protocol</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            Ensuring the security of the Ethiopian fuel grid and protecting user sovereignty through advanced digital safeguards.
          </p>
        </section>

        {/* POLICIES */}
        <section className="space-y-8">
          {policies.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 md:p-12 rounded-[2.5rem] bg-slate-50 border border-slate-200 relative group hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  {p.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{p.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed max-w-2xl text-lg">
                    {p.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* DETAILED GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {details.map((d, i) => (
             <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">{d.title}</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{d.content}</p>
             </div>
           ))}
        </section>

        {/* VERIFICATION BAR */}
        <div className="pt-10 border-t border-slate-100 flex justify-between items-center opacity-60">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Last Verified: March 2026</p>
           <div className="flex items-center gap-6">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div className="w-16 h-1.5 bg-slate-100 rounded-full" />
           </div>
        </div>

      </div>
    </main>
  );
}

