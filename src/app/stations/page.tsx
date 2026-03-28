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
      <div className="space-y-16 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          {features.map((f, i) => (
             <div 
               key={i} 
               className="group relative bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/[0.07] transition-all duration-300 overflow-hidden"
             >
               <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${f.color}-500/10 blur-[60px] rounded-full group-hover:scale-125 transition-transform pointer-events-none`} />
               
               <div className="w-16 h-16 mb-8 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-white/20 transition-all">
                 {f.icon}
               </div>
               <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{f.title}</h3>
               <p className="text-slate-500 font-bold leading-relaxed text-sm max-w-sm">
                 {f.desc}
               </p>
             </div>
          ))}
        </div>

        <div className="p-12 rounded-[3.5rem] bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-600/20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              Initialize Your <span className="text-indigo-400">Node</span>
            </h2>
            <p className="text-slate-400 font-bold text-lg">
              Deployment takes less than 120 seconds. Join the network to eliminate congestion and drive professional revenue growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/auth/register" 
                className="px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 hover:scale-105 transition-all w-full sm:w-auto"
              >
                Start Deployment
              </Link>
              <Link 
                href="/support" 
                className="px-10 py-5 bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white/20 transition-all border border-white/5 w-full sm:w-auto"
              >
                Contact Command
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center opacity-30 px-4">
           <div className="flex items-center gap-4">
              <Zap className="w-4 h-4 text-indigo-400" />
              <div className="w-12 h-1 bg-white/10" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Global Grid Ready</p>
           <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </PageLayout>
  );
}

