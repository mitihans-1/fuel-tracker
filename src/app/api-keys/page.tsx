import PageLayout from '@/components/PageLayout';
import { Key, Copy, RefreshCcw, Terminal, ShieldCheck, Code } from 'lucide-react';

export default function ApiKeysPage() {
  return (
    <PageLayout
      title="API Synchronization"
      subtitle="Generate and manage tactical access keys for grid telemetry integration."
    >
      <div className="space-y-16 text-left">
        <div className="p-12 rounded-[3rem] bg-white border border-slate-200 flex flex-col md:flex-row gap-10 items-center shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
           
           <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
              <Key className="w-12 h-12 text-indigo-600" />
           </div>
           <div className="flex-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Tactical Node Key</h3>
              <p className="text-slate-500 font-semibold text-lg leading-relaxed">Use this key to authenticate your local station telemetry hardware with the central synchronization hub.</p>
           </div>
           <div className="bg-slate-950 rounded-2xl px-6 py-4 flex items-center gap-6 group/key shadow-2xl">
              <code className="text-sm text-indigo-400 font-mono font-bold tracking-wider">fs_grid_test_48a92e...</code>
              <button 
                title="Copy API Key"
                className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
              >
                <Copy className="w-5 h-5" />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 space-y-8 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <Terminal className="w-6 h-6 text-slate-600" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight">Authentication Pulse</h4>
              </div>
              <div className="bg-slate-950 rounded-3xl p-8 font-mono text-sm text-slate-400 border border-slate-800 leading-relaxed shadow-inner">
                 <p className="text-indigo-400">curl -X POST \</p>
                 <p className="pl-6">&quot;https://api.fuelsync.et/v1/sync&quot; \</p>
                 <p className="pl-6">-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \</p>
                 <p className="pl-6">-H &quot;Content-Type: application/json&quot; \</p>
                 <p className="pl-6">-d {'\'{ &quot;node_id&quot;: &quot;site_08&quot;, &quot;stock&quot;: 4200 }\''}</p>
              </div>
           </div>

           <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 space-y-8 flex flex-col justify-center shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4">
                 <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                 </div>
                 <h4 className="text-xl font-black text-slate-900 tracking-tight">Security Protocol</h4>
              </div>
              <p className="text-slate-500 text-lg font-semibold leading-relaxed">
                 API keys provide full access to your station&apos;s resource telemetry. Never share these keys in client-side code or public repositories.
              </p>
              <button className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-all pt-4">
                 <RefreshCcw className="w-5 h-5" />
                 <span>Regenerate Master Key</span>
              </button>
           </div>
        </div>

        <div className="p-10 border-t border-slate-100 flex gap-6 opacity-40">
           <Code className="w-5 h-5 text-slate-400" />
           <div className="h-1 flex-1 bg-slate-100 mt-2.5 rounded-full" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Enterprise Node Access Activated</p>
        </div>
      </div>
    </PageLayout>
  );
}
