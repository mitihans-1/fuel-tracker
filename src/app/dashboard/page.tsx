"use client";

import { useSearchParams, useRouter } from "next/navigation";
import DriverDashboard from "@/components/DriverDashboard";
import StationDashboard from "@/components/StationDashboard";
import AdminDashboard from "../../components/AdminDashboard";
import { useUser } from "@/contexts/UserContext";
import { Suspense, useEffect, useState } from "react";

function DashboardContent() {
  const router = useRouter();
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const role = user?.role ?? "";
  const viewOverride = searchParams.get("view");
  const [hasOwnedStation, setHasOwnedStation] = useState(false);

  useEffect(() => {
    if (!loading && !role) {
      router.push("/auth/login");
    }
  }, [loading, role, router]);

  useEffect(() => {
    let mounted = true;
    if (!role) return;
    const checkOwned = async () => {
      try {
        const res = await fetch("/api/stations/owned");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setHasOwnedStation(Boolean(data?.hasOwnedStation));
      } catch {
        // ignore
      }
    };
    checkOwned();
    return () => {
      mounted = false;
    };
  }, [role]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 font-bold">Loading Dashboard...</div>;
  if (!role) return <div className="min-h-screen bg-slate-50" />;

  // If role is STATION or ADMIN, and view=driver is requested, show DriverDashboard
  const showDriverView = (role === "STATION" || role === "ADMIN") && viewOverride === "driver";
  const showStationViewFromOwned =
    (role === "DRIVER" || role === "ADMIN") && viewOverride === "station" && hasOwnedStation;
  const showStationDashboard = (role === "STATION" && !showDriverView) || showStationViewFromOwned;
  const showAdminDashboard = role === "ADMIN" && !showDriverView && !showStationViewFromOwned;
  const pageShellClass = showStationDashboard
    ? "min-h-screen"
    : "bg-slate-50 min-h-screen";

  return (
    <div className={pageShellClass}>
      {role === "DRIVER" && !showStationViewFromOwned && <DriverDashboard />}
      {showStationDashboard && <StationDashboard />}
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
      {showAdminDashboard && <AdminDashboard />}
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
