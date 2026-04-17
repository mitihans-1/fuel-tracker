import React from "react";

export default function SectionHeader({
  title,
  subtitle,
  action,
  badge,
  showGreeting,
  managerName,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: string;
  showGreeting?: boolean;
  managerName?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 w-full">
      <div className="space-y-1 sm:space-y-2 relative">
        {badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full bg-slate-100 border border-slate-200">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
              {badge}
            </span>
          </div>
        )}
        
        {showGreeting && managerName && (
          <p className="text-sm font-bold text-slate-500">
            Welcome back, <span className="text-indigo-600">{managerName}</span>
          </p>
        )}
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
