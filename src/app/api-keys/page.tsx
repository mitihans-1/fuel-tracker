import PageLayout from '@/components/PageLayout';
import { Key, Copy, RefreshCcw, Terminal, ShieldCheck, Code } from 'lucide-react';

export default function ApiKeysPage() {
  return (
    <PageLayout
      title="API Synchronization"
      subtitle="Generate and manage tactical access keys for grid telemetry integration."
    >
      <div className="space-y-12 text-left">
        <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row gap-8 items-center">
           <div className="w-20 h-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Key className="w-10 h-10 text-indigo-400" />
           </div>
           <div className="flex-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Tactical Node Key</h3>
              <p className="text-slate-500 font-bold text-sm">Use this key to authenticate your local station telemetry hardware with the central synchronization hub.</p>
           </div>
           <div className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 flex items-center gap-4 group">
              <code className="text-xs text-indigo-300 font-mono">fs_grid_test_48a92e...</code>
              <button className="text-slate-600 hover:text-white transition-colors">
                <Copy className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                 <Terminal className="w-5 h-5 text-slate-400" />
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">Authentication Pulse</h4>
              </div>
              <div className="bg-slate-950 rounded-2xl p-6 font-mono text-[11px] text-slate-400 border border-white/5 leading-relaxed">
                 <p className="text-indigo-400">curl -X POST \</p>
                 <p className="pl-4">"https://api.fuelsync.et/v1/sync" \</p>
                 <p className="pl-4">-H "Authorization: Bearer YOUR_API_KEY" \</p>
                 <p className="pl-4">-H "Content-Type: application/json" \</p>
                 <p className="pl-4">-d {'\'{ "node_id": "site_08", "stock": 4200 }\''}</p>
              </div>
           </div>

           <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-emerald-400" />
                 <h4 className="text-lg font-black text-white uppercase tracking-tight">Security Protocol</h4>
              </div>
              <p className="text-slate-500 text-sm font-bold leading-relaxed">
                 API keys provide full access to your station's resource telemetry. Never share these keys in client-side code or public repositories.
              </p>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-all">
                 <RefreshCcw className="w-4 h-4" />
                 <span>Regenerate Master Key</span>
              </button>
           </div>
        </div>

        <div className="p-8 border-t border-white/5 flex gap-4 opacity-30">
           <Code className="w-4 h-4 text-slate-500" />
           <div className="h-[2px] flex-1 bg-white/10 mt-2" />
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-600">Enterprise Node Access Activated</p>
        </div>
      </div>
    </PageLayout>
  );
}
