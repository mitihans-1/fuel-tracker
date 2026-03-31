import { ReactNode } from "react";
type PageLayoutProps = {
title: string;
subtitle: string;
children: ReactNode;
};
export default function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900 px-6 py-20 relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center mb-20 relative z-10">
        <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight text-slate-900 leading-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {children}
      </div>
    </div>
  );
}