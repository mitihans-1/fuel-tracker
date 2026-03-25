"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, clear } = useUser();
  const isDashboard = pathname?.startsWith("/dashboard");
  const userRole = isDashboard ? (user?.role ?? null) : null;

  // Notification bell state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== "DRIVER") return;
    try {
      const res = await fetch("/api/alerts/notifications");
      if (res.ok) setNotifications(await res.json());
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/alerts/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clear();
    router.push("/auth/login");
    setMenuOpen(false);
  };

  const coreLinks: { name: string; path: string }[] = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  if (isDashboard && userRole === "STATION") {
    coreLinks.push({ name: "Inventory Management", path: "/dashboard/inventory" });
  }
  if (isDashboard) {
    coreLinks.push({ name: "Settings", path: "/dashboard/settings" });
  }

  const marketingLinks = [{ name: "How It Works", path: "/#features" }];
  const authLinks = [{ name: "Register", path: "/auth/register" }];
  const visibleLinks = isDashboard ? coreLinks : [...coreLinks, ...marketingLinks];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
            ⛽
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            Fuel<span className="text-blue-400">Sync</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 text-sm font-bold">
            {visibleLinks.map(link => (
              <Link
                key={link.path}
                href={link.path}
                className={`transition-colors ${pathname === link.path ? "text-blue-400" : "text-white/60 hover:text-white"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            {/* Notification Bell — DRIVER only */}
            {isDashboard && userRole === "DRIVER" && (
              <div className="relative" ref={bellRef}>
                <button
                  onClick={() => setBellOpen(prev => !prev)}
                  className="relative p-2 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {bellOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-bold text-white">Fuel Alerts</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 transition">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-blue-200/50 text-center py-8 px-4">
                          No alerts yet. Enable petrol or diesel alerts in your dashboard.
                        </p>
                      ) : (
                        <ul className="divide-y divide-white/5">
                          {notifications.slice(0, 10).map(n => (
                            <li key={n._id} className={`px-4 py-3 text-sm ${n.read ? "opacity-60" : "bg-cyan-500/5"}`}>
                              <div className="flex items-start gap-2">
                                {!n.read && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0" />}
                                <div className={!n.read ? "" : "ml-3.5"}>
                                  <p className="font-semibold text-white text-xs">{n.title}</p>
                                  <p className="text-blue-200/70 text-xs mt-0.5">{n.message}</p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all cursor-pointer"
              >
                Logout
              </button>
            ) : (
              authLinks.map(link => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    pathname === link.path
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Mobile: bell + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {isDashboard && userRole === "DRIVER" && (
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen(prev => !prev)}
                className="relative p-2 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-bold text-white">Fuel Alerts</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-400">Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-blue-200/50 text-center py-6 px-4">No alerts yet.</p>
                    ) : (
                      <ul className="divide-y divide-white/5">
                        {notifications.slice(0, 8).map(n => (
                          <li key={n._id} className={`px-4 py-3 text-sm ${n.read ? "opacity-60" : "bg-cyan-500/5"}`}>
                            <p className="font-semibold text-white text-xs">{n.title}</p>
                            <p className="text-blue-200/70 text-xs mt-0.5">{n.message}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {visibleLinks.map(link => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                pathname === link.path
                  ? "bg-blue-600/20 text-blue-300 border border-blue-500/20"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-300 hover:bg-red-500/10 transition-all"
              >
                Logout
              </button>
            ) : (
              authLinks.map(link => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    pathname === link.path
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.name}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
