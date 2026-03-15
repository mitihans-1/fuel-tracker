"use client";

import { useState, useEffect } from "react";
import DriverDashboard from "@/components/DriverDashboard";
import StationDashboard from "@/components/StationDashboard";
import AdminDashboard from "../../components/AdminDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setAuthError(data.error || "Session expired");
          setRole("");
          return;
        }
        const data = await res.json();
        setRole(data.role);
      })
      .catch(() => {
        setAuthError("Unable to verify session");
        setRole("");
      });
  }, []);

  return (
    <div>
      {role === "DRIVER" && <DriverDashboard />}
      {role === "STATION" && <StationDashboard />}
      {role === "ADMIN" && <AdminDashboard />}
      {!role && !authError && <p>Loading...</p>}
      {!role && authError && (
        <p className="text-center text-red-400 mt-8">
          {authError}. Please sign in again.
        </p>
      )}
    </div>
  );
}