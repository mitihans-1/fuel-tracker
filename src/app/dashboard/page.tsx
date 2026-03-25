"use client";

import DriverDashboard from "@/components/DriverDashboard";
import StationDashboard from "@/components/StationDashboard";
import AdminDashboard from "../../components/AdminDashboard";
import { useUser } from "@/contexts/UserContext";

export default function DashboardPage() {
  const { user, loading } = useUser();
  const role = user?.role ?? "";

  if (loading) return <p className="text-center text-white mt-16">Loading...</p>;
  if (!role) return (
    <p className="text-center text-red-400 mt-8">
      Session expired. Please sign in again.
    </p>
  );

  return (
    <div>
      {role === "DRIVER" && <DriverDashboard />}
      {role === "STATION" && <StationDashboard />}
      {role === "ADMIN" && <AdminDashboard />}
    </div>
  );
}
