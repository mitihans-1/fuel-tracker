"use client";

import { Suspense } from "react";
import Navbar from "./Navbar";

export default function ClientNavbar() {
  return (
    <Suspense fallback={null}>
      <Navbar />
    </Suspense>
  );
}