import PageLayout from "@/components/PageLayout";

export default function Features() {
  return (
    <PageLayout
      title="Powerful Features"
      subtitle="Everything you need to manage fuel access efficiently"
    >
      <div className="grid md:grid-cols-3 gap-8">
        {[
          "Real-time fuel tracking",
          "Digital queue system",
          "Smart navigation",
          "Station dashboards",
          "Notifications system",
          "Secure payments"
        ].map((item, i) => (
          <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-slate-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 shadow-lg text-slate-900 font-black text-xl tracking-tight text-center flex items-center justify-center min-h-[160px]">
            {item}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}