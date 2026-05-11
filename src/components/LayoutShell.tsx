"use client";

import ClientNavbar from "@/components/ClientNavbar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientNavbar />
      <main className="flex flex-col">{children}</main>

    </>
  );
}
