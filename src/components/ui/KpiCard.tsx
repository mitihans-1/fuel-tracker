import React from "react";

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
};

export default function KpiCard({ label, value, hint, icon, className = "" }: KpiCardProps) {
  return (
    <div className={`pro-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="text-xs text-slate-500 mt-2">{hint}</p> : null}
    </div>
  );
}
