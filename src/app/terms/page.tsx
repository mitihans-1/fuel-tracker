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
      <div className="space-y-16 text-left">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest w-fit shadow-sm">
          <FileText className="w-5 h-5" />
          <span>Last Revised: March 28, 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {provisions.map((term, idx) => (
            <div key={idx} className="p-10 rounded-[2.5rem] bg-white border border-slate-200 space-y-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shadow-inner">
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">{term.title}</h3>
              </div>
              <p className="text-slate-500 font-semibold leading-relaxed text-lg relative z-10">
                {term.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="p-12 rounded-[3rem] bg-red-50 border border-red-100 space-y-6 shadow-sm">
           <div className="flex items-center gap-4 text-red-600">
              <ShieldAlert className="w-8 h-8" />
              <h4 className="text-2xl font-black tracking-tight">Limitation of Liability</h4>
           </div>
           <p className="text-red-900/70 font-bold text-lg leading-relaxed italic">
             TO THE MAXIMUM EXTENT PERMITTED UNDER ETHIOPIAN LAW, FUELSYNC SHALL NOT BE LIABLE FOR ANY CONSEQUENTIAL, INCIDENTAL, OR SPECIAL DAMAGES ARISING OUT OF THE USE OF OR INABILITY TO ACCESS THE FUEL GRID TELEMETRY.
           </p>
        </div>

        <div className="flex justify-center pt-10">
           <div className="flex items-center gap-4 opacity-30">
              <Scale className="w-6 h-6 text-slate-400" />
              <div className="w-32 h-1 bg-slate-200 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-300" />
           </div>
        </div>
      </div>
    </PageLayout>
  );
}

