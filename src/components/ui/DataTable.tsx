import React from "react";

export default function DataTable({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pro-card overflow-hidden ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
