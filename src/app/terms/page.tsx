import PageLayout from '@/components/PageLayout';
import { FileText, CheckCircle, AlertCircle, Scale, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  const provisions = [
    {
      title: "1. Operational Conduct",
      desc: "Users must adhere to the Strategic Refueling Protocol. Any attempt to manipulate station telemetry or bypass the digital queue system will result in immediate termination of grid access."
    },
    {
      title: "2. Data Accuracy & Synchronization",
      desc: "Wait-time estimates and stock intensities are provided 'as-is' via real-time satellite telemetry. FuelSync is not liable for minor discrepancies caused by site-specific hardware latency."
    },
    {
      title: "3. Digital Payment Protocol",
      desc: "All transactions handled via Chapa or TeleBirr are subject to their respective security layers. FuelSync acts as the synchronization medium and is not responsible for external bank gateway failures."
    },
    {
      title: "4. Resource Misuse",
      desc: "The platform is intended for legitimate fuel tracking. Automation or scraping of station data for third-party commercial exploitation without a Business API Key is strictly prohibited."
    }
  ];

  return (
    <PageLayout
      title="Terms of Engagement"
      subtitle="The professional framework governing the use of the FuelSync Strategic Grid."
    >
      <div className="space-y-12 text-left">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest w-fit">
          <FileText className="w-4 h-4" />
          <span>Last Revised: March 28, 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {provisions.map((term, idx) => (
            <div key={idx} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-4 hover:bg-white/[0.07] transition-all group">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                 </div>
                 <h3 className="text-lg font-black text-white uppercase tracking-tight">{term.title}</h3>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed text-sm">
                {term.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="p-10 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 space-y-4">
           <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h4 className="text-xl font-black uppercase tracking-tight">Limitation of Liability</h4>
           </div>
           <p className="text-slate-500 font-bold text-sm leading-relaxed">
             TO THE MAXIMUM EXTENT PERMITTED UNDER ETHIOPIAN LAW, FUELSYNC SHALL NOT BE LIABLE FOR ANY CONSEQUENTIAL, INCIDENTAL, OR SPECIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO ACCESS THE FUEL GRID TELEMETRY.
           </p>
        </div>

        <div className="flex justify-center pt-8">
           <div className="flex items-center gap-2 opacity-20">
              <Scale className="w-5 h-5 text-white" />
              <div className="w-24 h-[1px] bg-white" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
           </div>
        </div>
      </div>
    </PageLayout>
  );
}

