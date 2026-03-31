"use client";

import { useSearchParams, useRouter } from "next/navigation";
import DriverDashboard from "@/components/DriverDashboard";
import StationDashboard from "@/components/StationDashboard";
import AdminDashboard from "../../components/AdminDashboard";
import { useUser } from "@/contexts/UserContext";
import { Suspense } from "react";

function DashboardContent() {
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const role = user?.role ?? "";
  const viewOverride = searchParams.get("view");

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-bold">Loading Dashboard...</div>;
  if (!role) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="px-6 py-4 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold">
        Session expired. Please sign in again.
      </p>
    </div>
  );

  // If role is STATION or ADMIN, and view=driver is requested, show DriverDashboard
  const showDriverView = (role === "STATION" || role === "ADMIN") && viewOverride === "driver";

  return (
    <div className="bg-slate-50 min-h-screen">
      {role === "DRIVER" && <DriverDashboard />}
      {role === "STATION" && !showDriverView && <StationDashboard />}
      {role === "STATION" && showDriverView && (
        <div className="relative">
          {/* Back to Station Owner view floating button */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1001]">
            <a 
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 border border-slate-700 hover:bg-slate-800 transition-all hover:scale-105"
            >
              ← Back to Station Management
            </a>
          </div>
          <DriverDashboard />
        </div>
      )}
      {role === "ADMIN" && !showDriverView && <AdminDashboard />}
      {role === "ADMIN" && showDriverView && <DriverDashboard />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 font-bold">Initializing...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
