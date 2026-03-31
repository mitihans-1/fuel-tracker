import PageLayout from '@/components/PageLayout';
import { Book, Code, Shield, Activity, Zap, Cpu } from 'lucide-react';

export default function DocumentationPage() {
  const sections = [
    {
      title: "System Architecture",
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      content: "FuelSync's core protocol is built on a high-concurrency Node.js architecture designed to handle thousands of real-time fuel grid telemetry updates per minute across every node in the Ethiopian network."
    },
    {
      title: "Real-Time Sync Protocol",
      icon: <Activity className="w-6 h-6 text-blue-400" />,
      content: "Our synchronization engine utilizes advanced WebSocket communication layered with AI-driven queue prediction to ensure drivers receive sub-10ms precision on wait-time metrics at every site."
    },
    {
      title: "Security & Encryption",
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      content: "All transactions and station logs are secured via AES-256 military-grade encryption, ensuring that every Nafta and Benzene unit is tracked and synchronized with total fiscal transparency."
    },
    {
      title: "Driver API Integration",
      icon: <Code className="w-6 h-6 text-amber-400" />,
      content: "Third-party fleet managers can integrate directly with our JSON REST API to monitor fuel consumption across large vehicle deployments, allowing for automated resource allocation."
    }
  ];

  return (
    <PageLayout
      title="Technical Protocol"
      subtitle="Comprehensive system intelligence and integration guidelines for the FuelSync Grid."
    >
      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden">
              {/* Card Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                  {section.content}
                </p>
                <div className="mt-8 h-1 w-10 bg-slate-100 group-hover:w-20 group-hover:bg-indigo-500 transition-all duration-300 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-12 rounded-[3rem] bg-white border border-slate-200 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center text-center md:text-left">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
              <Book className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Standard Operating Procedure</h4>
              <p className="text-slate-500 font-semibold max-w-xl text-lg leading-relaxed">
                Access the full FuelSync operational manual for station managers and fleet administrators. Includes detailed troubleshooting for synchronized telemetry hardware.
              </p>
            </div>
            <button className="px-10 py-5 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
              Download Full PDF
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

