import PageLayout from '@/components/PageLayout';

export default function Page() {
  return (
    <PageLayout
      title="Contact"
      subtitle="Everything you need to know about Contact at FuelSync."
    >
      <div className="prose prose-invert max-w-none">
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-slate-400">
            This page is currently under development. Please check back soon for more information about Contact.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

