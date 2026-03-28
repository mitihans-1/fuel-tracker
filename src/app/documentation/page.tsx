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
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.07] group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{section.title}</h3>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
              <Book className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Standard Operating Procedure</h4>
              <p className="text-slate-500 font-bold max-w-xl">
                Access the full FuelSync operational manual for station managers and fleet administrators. Includes detailed troubleshooting for synchronized telemetry hardware.
              </p>
            </div>
            <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-200 transition-all ml-auto">
              Download Full PDF
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

