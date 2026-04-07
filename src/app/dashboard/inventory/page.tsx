"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

export default function InventoryPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    
    // Redirect to the main dashboard with the products tab active
    // This ensures they get the sidebar and the full dashboard experience
    router.replace("/dashboard?tab=products");
  }, [loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Loading Inventory Control...</p>
      </div>
    </div>
  );
}
