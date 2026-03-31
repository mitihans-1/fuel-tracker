import PageLayout from '@/components/PageLayout';
import { Lock, Eye, ShieldCheck, Database, Globe } from 'lucide-react';

export default function PrivacyPage() {
  const policies = [
    {
      title: "Data Sovereignty",
      icon: <Database className="w-5 h-5 text-indigo-400" />,
      text: "At FuelSync, we believe your fueling telemetry is yours. All personal data is stored in decentralized containers, ensuring that neither the government nor the platform can access granular driver routes without explicit authorization keys."
    },
    {
      title: "Encryption Standards",
      icon: <Lock className="w-5 h-5 text-blue-400" />,
      text: "Every byte of data transmitted between your vehicle and the station grid is encrypted using military-grade AES-256 protocols. This ensures your payment credentials and resource levels remain private at all times."
    },
    {
      title: "Zero-Knowledge Monitoring",
      icon: <Eye className="w-5 h-5 text-emerald-400" />,
      text: "Our analytics systems use zero-knowledge proofs to monitor station congestion. We can estimate wait times and stock levels without ever needing to know the identity or specific location of individual drivers."
    }
  ];

  return (
    <PageLayout
      title="Privacy Protocol"
      subtitle="Ensuring the security of the Ethiopian fuel grid and protecting user sovereignty."
    >
      <div className="space-y-16 text-left">
        <div className="flex items-center gap-4 text-slate-400 font-black uppercase tracking-[0.4em] text-xs mb-10">
           <Globe className="w-5 h-5 text-indigo-500" />
           <span>Global Security Compliance v2.6</span>
        </div>

        <div className="space-y-10">
          {policies.map((p, i) => (
            <div key={i} className="p-12 rounded-[3rem] bg-white border border-slate-200 relative group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start gap-10 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                  {p.icon}
                </div>
                <div className="space-y-5">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{p.title}</h3>
                  <p className="text-slate-500 font-semibold leading-relaxed max-w-2xl text-lg">
                    {p.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-10 border-t border-slate-100 flex justify-between items-center opacity-50">
           <p className="text-xs font-black uppercase tracking-widest leading-none text-slate-400">Last Verified: March 2026</p>
           <div className="flex items-center gap-6">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div className="w-16 h-1 bg-slate-200 rounded-full mt-1" />
           </div>
        </div>
      </div>
    </PageLayout>
  );
}

