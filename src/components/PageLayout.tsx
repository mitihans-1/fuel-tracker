import { ReactNode } from "react";
type PageLayoutProps = {
title: string;
subtitle: string;
children: ReactNode;
};
export default function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-text px-6 py-20 transition-colors duration-300">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          {title}
        </h1>
        <p className="opacity-70 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-card backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}