"use client"
import ClientNavbar from "@/components/ClientNavbar";
import { FileText, CheckCircle, AlertCircle, Scale, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const provisions = [
    {
      title: "1. Operational Conduct",
      desc: "Users must adhere to the Strategic Refueling Protocol. Any attempt to manipulate station telemetry will result in termination of access."
    },
    {
      title: "2. Data Accuracy",
      desc: "Wait-time estimates and stock levels are provided 'as-is'. FuelSync is not liable for minor discrepancies caused by site latency."
    },
    {
      title: "3. Payment Protocol",
      desc: "All transactions handled via third-party gateways are subject to their respective security layers and terms."
    },
    {
      title: "4. Resource Misuse",
      desc: "The platform is intended for legitimate fuel tracking. Automation or scraping of station data for commercial exploitation is prohibited."
    }
  ];

  const violations = [
    { title: "Grid Manipulation", effect: "Permanent ban from the network and referral to national energy regulators." },
    { title: "Payment Fraud", effect: "Immediate account freezing and collaboration with banking security teams." },
    { title: "Identity Forgery", effect: "Revocation of all access keys and deletion of associated node telemetry history." }
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
            <FileText className="w-3.5 h-3.5" />
            Last Revised: March 28, 2026
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            Terms of <span className="text-indigo-600">Engagement</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            The professional framework governing the use of the FuelSync Strategic Grid and its digital resources.
          </p>
        </section>

        {/* PROVISIONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {provisions.map((term, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 space-y-6 group relative overflow-hidden hover:shadow-2xl transition-all duration-500"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 transition-colors shadow-sm">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">{term.title}</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed text-lg relative z-10">
                {term.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* VIOLATION PROTOCOLS */}
        <section className="p-12 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blur-[100px] rounded-full" />
           <div className="relative z-10 space-y-10">
              <div className="flex items-center gap-4 text-red-400 font-black uppercase tracking-[0.2em] text-[10px]">
                 <AlertCircle className="w-5 h-5" />
                 <span>Enforcement Protocols</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {violations.map((v, i) => (
                   <div key={i} className="space-y-3">
                      <h5 className="text-lg font-black text-white">{v.title}</h5>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">{v.effect}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* LIABILITY */}
        <section className="p-12 rounded-[3rem] bg-red-50 border border-red-100 space-y-6 shadow-sm">
           <div className="flex items-center gap-4 text-red-600">
              <ShieldAlert className="w-8 h-8" />
              <h4 className="text-2xl font-black tracking-tight uppercase">Limitation of Liability</h4>
           </div>
           <p className="text-red-900 font-bold text-lg leading-relaxed italic">
             To the maximum extent permitted under law, FuelSync shall not be liable for any consequential, incidental, or special damages arising out of the use of or inability to access the platform telemetry.
           </p>
        </section>

        {/* BOTTOM BAR */}
        <div className="flex justify-center pt-10 opacity-30">
           <div className="flex items-center gap-4">
              <Scale className="w-6 h-6 text-slate-400" />
              <div className="w-32 h-1.5 bg-slate-100 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-200" />
           </div>
        </div>

      </div>
    </main>
  );
}

