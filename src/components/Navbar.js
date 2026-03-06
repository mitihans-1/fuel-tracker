"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/auth/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between">
      {/* Logo */}
      <h1 className="font-bold text-lg">
        Fuel Tracker ⛽
      </h1>

      {/* Navigation links */}
      <div className="space-x-4">
        <Link href="/">Home</Link>
        <Link href="/auth/login">Login</Link>
        <Link href="/auth/register">Register</Link>
        <Link href="/dashboard">Dashboard</Link>

        {/* Logout Button - show only on dashboard page */}
        {pathname && pathname.startsWith("/dashboard") && (
          <button
  onClick={async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  }}
>
  Logout
</button>
        )}
      </div>
    </nav>
  );
}