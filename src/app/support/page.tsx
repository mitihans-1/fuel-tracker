import PageLayout from '@/components/PageLayout';
import { Mail, Phone, MessageSquare, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <PageLayout
      title="Grid Command Support"
      subtitle="Access tactical assistance and technical synchronization protocols."
    >
      <div className="space-y-12 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <div className="space-y-10 order-2 md:order-1">
              <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                 <div className="flex items-center gap-4 text-indigo-400">
                    <MessageSquare className="w-8 h-8" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Tactical Query</h3>
                 </div>
                 <p className="text-slate-500 font-bold text-sm leading-relaxed">
                   Immediate technical assistance for station owners on-site. Our synchronization specialists are available 24/7.
                 </p>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <button className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all text-left">
                       <Mail className="w-5 h-5 text-slate-500" />
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Email</p>
                          <p className="text-xs font-bold text-white">command@fuelsync.et</p>
                       </div>
                    </button>
                    <button className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all text-left">
                       <Phone className="w-5 h-5 text-slate-500" />
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Direct Link</p>
                          <p className="text-xs font-bold text-white">+251 901 234 567</p>
                       </div>
                    </button>
                 </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/5 space-y-4">
                 <div className="flex justify-between items-center text-emerald-400">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">System Status</span>
                    </div>
                    <CheckCircle className="w-4 h-4" />
                 </div>
                 <p className="text-lg font-black text-white uppercase tracking-tight">Main Grid Nominal</p>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global synchronization fully operational.</p>
              </div>
           </div>

           <div className="order-1 md:order-2">
              <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:scale-125 transition-transform" />
                 <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Initialize Support Ticket</h4>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Node Identifier</p>
                       <input type="text" placeholder="Full Name or Station ID..." className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Contact Vector</p>
                       <input type="email" placeholder="official@email.com" className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Incident Details</p>
                       <textarea placeholder="Describe the tactical issue in detail..." className="w-full p-4 h-32 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all font-medium" />
                    </div>
                    <button className="w-full py-6 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
                       Transmit Request
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-between items-center opacity-30 pt-12 border-t border-white/5">
           <Cpu className="w-5 h-5 text-slate-500" />
           <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-600 italic">24/7 Grid Support Link Active</p>
           <ShieldAlert className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </PageLayout>
  );
}
