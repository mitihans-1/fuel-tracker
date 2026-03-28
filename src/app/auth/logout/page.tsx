"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function LogoutPage() {
  const router = useRouter();
  const { clear } = useUser();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        clear();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        router.replace("/auth/login");
      }
    };

    performLogout();
  }, [clear, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Terminating Session...</p>
    </div>
  );
}
