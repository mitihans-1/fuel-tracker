import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { Layout, Link as LinkIcon, Layers, Monitor, ChevronRight, Fuel, ShieldCheck, Zap } from 'lucide-react';

export default function StationPortalPage() {
  const features = [
    {
      icon: <Layers className="w-8 h-8 text-blue-400" />,
      title: "Tactical Inventory",
      desc: "Stop estimation. Track your diesel and petrol stock intensities with sub-liter precision and broadcast availability to the grid.",
      color: "blue"
    },
    {
      icon: <Layout className="w-8 h-8 text-indigo-400" />,
      title: "Queue Orchestration",
      desc: "Prevent site congestion through digital orchestration. Manage incoming vehicles and broadcast accurate wait-time telemetry.",
      color: "indigo"
    },
    {
      icon: <LinkIcon className="w-8 h-8 text-emerald-400" />,
      title: "Unified Payments",
      desc: "Execute frictionless transactions via integrated mobile gateways. Clear queues with rapid, decentralized payment verification.",
      color: "emerald"
    },
    {
      icon: <Monitor className="w-8 h-8 text-amber-400" />,
      title: "Grid Analytics",
      desc: "Analyze peak demand cycles and revenue trends through your command center dashboard. Optimize your site productivity.",
      color: "amber"
    }
  ];

  return (
    <PageLayout
      title="Station Command Portal"
      subtitle="Modernize your fuel infrastructure and synchronize your site with the FuelSync Grid."
    >
      <div className="space-y-20 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8">
          {features.map((f, i) => (
             <div 
               key={i} 
               className="group relative bg-white border border-slate-200 p-12 rounded-[3rem] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
             >
               <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${f.color}-500/5 blur-[60px] rounded-full group-hover:scale-125 transition-transform pointer-events-none`} />
               
               <div className="w-16 h-16 mb-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:border-indigo-200 transition-all">
                 {f.icon}
               </div>
               <h3 className="text-2xl font-black mb-5 text-slate-900 tracking-tight">{f.title}</h3>
               <p className="text-slate-500 font-semibold leading-relaxed text-lg max-w-sm">
                 {f.desc}
               </p>
               <div className={`mt-10 h-1.5 w-12 bg-slate-100 group-hover:w-24 group-hover:bg-indigo-500 transition-all duration-500 rounded-full`} />
             </div>
          ))}
        </div>

        <div className="p-16 rounded-[4rem] bg-white border border-slate-200 relative overflow-hidden text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
          
          <div className="max-w-2xl mx-auto space-y-10 relative z-10">
            <h2 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
              Initialize Your <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">Node</span>
            </h2>
            <p className="text-slate-500 font-semibold text-xl leading-relaxed">
              Deployment takes less than 120 seconds. Join the network to eliminate congestion and drive professional revenue growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link 
                href="/auth/register" 
                className="px-12 py-6 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all w-full sm:w-auto"
              >
                Start Deployment
              </Link>
              <Link 
                href="/support" 
                className="px-12 py-6 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 transition-all border border-slate-200 w-full sm:w-auto shadow-sm"
              >
                Contact Command
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center opacity-40 px-6">
           <div className="flex items-center gap-6">
              <Zap className="w-5 h-5 text-indigo-500" />
              <div className="w-16 h-1 bg-slate-200 rounded-full" />
           </div>
           <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-400">Global Grid Ready</p>
           <ShieldCheck className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
    </PageLayout>
  );
}

