import React from "react";

export default function ActionBar({
  left,
  right,
  className = "",
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`pro-card p-4 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
