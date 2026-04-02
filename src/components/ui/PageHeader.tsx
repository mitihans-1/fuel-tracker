import React from "react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{eyebrow}</p> : null}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
        {subtitle ? <p className="text-slate-500 text-sm max-w-xl font-medium">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
