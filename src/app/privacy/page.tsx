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
      <div className="space-y-12 text-left">
        <div className="flex items-center gap-4 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] mb-8">
           <Globe className="w-4 h-4" />
           <span>Global Security Compliance v2.6</span>
        </div>

        <div className="space-y-8">
          {policies.map((p, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 relative group hover:bg-white/[0.08] transition-all">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{p.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">
                    {p.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 border-t border-white/5 flex justify-between items-center opacity-40">
           <p className="text-[9px] font-black uppercase tracking-widest leading-none text-slate-500">Last Verified: March 2026</p>
           <div className="flex gap-4">
              <ShieldCheck className="w-4 h-4" />
              <div className="w-12 h-0.5 bg-white/20 mt-2" />
           </div>
        </div>
      </div>
    </PageLayout>
  );
}

