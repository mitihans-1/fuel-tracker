import PageLayout from '@/components/PageLayout';

export default function Page() {
  return (
    <PageLayout
      title="Careers"
      subtitle="Everything you need to know about Careers at FuelSync."
    >
      <div className="max-w-none">
        <div className="p-12 rounded-[3rem] bg-white border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full" />
          <p className="text-slate-500 text-lg font-semibold leading-relaxed relative z-10">
            This page is currently under development. Please check back soon for more information about joining our team and building the future of fuel infrastructure.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

