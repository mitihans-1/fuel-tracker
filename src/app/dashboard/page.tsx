"use client";

import { useState, useEffect } from "react";
import DriverDashboard from "@/components/DriverDashboard";
import StationDashboard from "@/components/StationDashboard";
import AdminDashboard from "../../components/AdminDashboard";

export default function DashboardPage() {
  const [role, setRole] = useState("");

 useEffect(() => {
  fetch("/api/auth/me")
    .then(res => res.json())
    .then(data => setRole(data.role))
    .catch(() => setRole("error"));
}, []);

  return (
    <div>
      {role === "DRIVER" && <DriverDashboard />}
      {role === "STATION" && <StationDashboard />}
      {role === "ADMIN" && <AdminDashboard />}
      {!role && <p>Loading...</p>}
    </div>
  );
}