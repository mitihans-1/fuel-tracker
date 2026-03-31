import PageLayout from '@/components/PageLayout';
import { Mail, Phone, MessageSquare, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <PageLayout
      title="Grid Command Support"
      subtitle="Access tactical assistance and technical synchronization protocols."
    >
      <div className="space-y-16 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
           <div className="space-y-12 order-2 md:order-1">
              <div className="p-10 rounded-[3rem] bg-white border border-slate-200 space-y-8 shadow-lg hover:shadow-2xl transition-all duration-500">
                 <div className="flex items-center gap-5 text-indigo-600">
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner">
                       <MessageSquare className="w-10 h-10" />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-slate-900">Tactical Query</h3>
                 </div>
                 <p className="text-slate-500 font-semibold text-lg leading-relaxed">
                   Immediate technical assistance for station owners on-site. Our synchronization specialists are available 24/7.
                 </p>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <button className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-all text-left group">
                       <Mail className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Email</p>
                          <p className="text-sm font-black text-slate-900">command@fuelsync.et</p>
                       </div>
                    </button>
                    <button className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-all text-left group">
                       <Phone className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Direct Link</p>
                          <p className="text-sm font-black text-slate-900">+251 901 234 567</p>
                       </div>
                    </button>
                 </div>
              </div>

              <div className="p-10 rounded-[3rem] bg-emerald-50 border border-emerald-100 space-y-5 shadow-sm">
                 <div className="flex justify-between items-center text-emerald-600">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                       <span className="text-xs font-black uppercase tracking-widest">System Status</span>
                    </div>
                    <CheckCircle className="w-6 h-6" />
                 </div>
                 <p className="text-2xl font-black text-slate-900 tracking-tight">Main Grid Nominal</p>
                 <p className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest leading-relaxed">Global synchronization fully operational.</p>
              </div>
           </div>

           <div className="order-1 md:order-2">
              <div className="p-12 rounded-[3.5rem] bg-white border border-slate-200 space-y-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-700" />
                 <h4 className="text-3xl font-black text-slate-900 tracking-tight relative z-10">Initialize Support Ticket</h4>
                 <div className="space-y-8 relative z-10">
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Node Identifier</p>
                       <input type="text" placeholder="Full Name or Station ID..." className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-semibold shadow-sm" />
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Contact Vector</p>
                       <input type="email" placeholder="official@email.com" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-semibold shadow-sm" />
                    </div>
                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Incident Details</p>
                       <textarea placeholder="Describe the tactical issue in detail..." className="w-full p-5 h-40 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all font-semibold shadow-sm" />
                    </div>
                    <button className="w-full py-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 pt-2">
                       Transmit Request ✓
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex justify-between items-center opacity-40 pt-16 border-t border-slate-100">
           <Cpu className="w-6 h-6 text-slate-400" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">24/7 Grid Support Link Active</p>
           <ShieldAlert className="w-6 h-6 text-slate-400" />
        </div>
      </div>
    </PageLayout>
  );
}
