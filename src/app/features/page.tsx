import PageLayout from "@/components/PageLayout";

export default function Features() {
  return (
    <PageLayout
      title="Powerful Features"
      subtitle="Everything you need to manage fuel access efficiently"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {[
          "Real-time fuel tracking",
          "Digital queue system",
          "Smart navigation",
          "Station dashboards",
          "Notifications system",
          "Secure payments"
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            {item}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}