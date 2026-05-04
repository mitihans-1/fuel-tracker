"use client";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import {  Bell,  LogOut,  ChevronDown } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
}

interface NavigationLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
 const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, clear } = useUser();
  const profileDisplayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Account";
  const isDashboard = pathname?.startsWith("/dashboard");
  const userRole = isDashboard ? (user?.role ?? null) : null;
  const isStationView = isDashboard && searchParams.get("view") === "station";
  const currentQuery = searchParams.toString();

  const isNavLinkActive = (linkPath: string) => {
    if (!pathname) return false;
    const [linkBasePath, linkQuery = ""] = linkPath.split("?");
    if (pathname !== linkBasePath) return false;

    // Exact route without query should only be active when current URL has no query.
    if (!linkQuery) return currentQuery.length === 0;

    const linkParams = new URLSearchParams(linkQuery);
    for (const [key, value] of linkParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

  // Notification bell state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hasOwnedStation, setHasOwnedStation] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  

  const fetchNotifications = useCallback(async () => {
    if (!user || user.role !== "DRIVER") return;
    try {
      const res = await fetch("/api/alerts/notifications");
      if (res.ok) setNotifications(await res.json());
    } catch { /* silent */ }
  }, [user]);

 useEffect(() => {
  const load = async () => {
    await fetchNotifications(); // ✅ safe now
  };

  load();

  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000);

  return () => clearInterval(interval);
}, [fetchNotifications]);

  useEffect(() => {
    let mounted = true;
    const checkOwnedStation = async () => {
      if (!isDashboard || !user) return;
      try {
        const res = await fetch("/api/stations/owned");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setHasOwnedStation(Boolean(data?.hasOwnedStation));
      } catch {
        // ignore
      }
    };
    checkOwnedStation();
    return () => {
      mounted = false;
    };
  }, [isDashboard, user]);

  // Close bell dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
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

  const coreLinks: NavigationLink[] = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  if (isDashboard && userRole === "STATION") {
    coreLinks.push({ name: "Products", path: "/dashboard/inventory" });
    coreLinks.push({ name: "Register New Station", path: "/dashboard?action=register" });
  }
  if (isDashboard && userRole === "ADMIN") {
    coreLinks.push({ name: "Register New Station", path: "/dashboard?action=register" });
  }
  if (isDashboard && (userRole === "DRIVER" || userRole === "ADMIN") && hasOwnedStation) {
    coreLinks.push({ name: "Station Dashboard", path: "/dashboard?view=station" });
  }
  


  const marketingLinks: NavigationLink[] = [
    { name: "About", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "How It Works", path: "/#features" },
    { name: "Contact", path: "/contact" },
  ];
  const authLinks: NavigationLink[] = [{ name: "Register", path: "/auth/register" }];
  const visibleLinks: NavigationLink[] = isDashboard ? coreLinks : [...coreLinks, ...marketingLinks];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 w-full bg-slate-900 border-b border-white/10">
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
              link.icon ? (
                <div key={link.name}>{link.icon}</div>
              ) : (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`transition-colors ${isNavLinkActive(link.path) ? "text-blue-400" : "text-white/60 hover:text-white"}`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* <ThemeSwitcher /> */}

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-3">
          {/* Driver Dashboard Top Navigation (Text Style) */}
{isDashboard && userRole === "DRIVER" && !isStationView && (
  <div className="flex items-center gap-2 mr-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-sm">

    {[
      // { name: "Dashboard", path: "/dashboard?tab=dashboard" },
      { name: "Fuel Logs", path: "/dashboard?tab=logs" },
      { name: "Vehicles", path: "/dashboard?tab=vehicles" },
      // ...(hasOwnedStation ? [{ name: "Station", path: "/dashboard?view=station" }] : []),
    ].map((link) => {
     const currentTab = searchParams.get("tab");

const isActive =
  pathname === "/dashboard" &&
  (
    currentTab === link.path.split("=")[1] ||
    (!currentTab && link.name === "Fuel Logs") // default tab
  );

      return (
        <Link
          key={link.path}
          href={link.path}
          className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            isActive
              ? "text-white bg-indigo-600 shadow-md"
              : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
        >
          {link.name}

          {/* Active underline glow */}
          {isActive && (
            <span className="absolute left-1/2 -bottom-1 w-6 h-[2px] bg-white rounded-full -translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
          )}
        </Link>
      );
    })}
  </div>
)}

            {/* Notification Bell */}
            {isDashboard && (
              <div className="relative" ref={bellRef}>
                <button
                  onClick={(e) => { e.preventDefault(); setBellOpen(prev => !prev); }}
                  className="relative p-1.5 rounded-xl hover:bg-white/10 transition text-white/70 hover:text-white"
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
                  <div className="absolute right-0 top-full mt-3 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-black text-white italic">Protocol Alerts</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">
                          Mark Read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-[10px] font-black text-slate-500 text-center py-10 px-6 uppercase tracking-[0.2em]">Zero System Signals</p>
                      ) : (
                        <ul className="divide-y divide-white/5">
                          {notifications.slice(0, 5).map(n => (
                            <li key={n._id} className={`px-4 py-4 text-sm hover:bg-white/5 transition-colors ${n.read ? "opacity-50" : "bg-blue-500/5"}`}>
                              <div className="flex items-start gap-3">
                                {!n.read && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shadow-[0_0_8px_rgba(96,165,250,1)]" />}
                                <div className={!n.read ? "" : "ml-4.5"}>
                                  <p className="font-black text-white text-[10px] uppercase tracking-wider">{n.title}</p>
                                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
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
              (userRole === "DRIVER" || userRole === "STATION" || userRole === "ADMIN") ? (
                <div className="relative" ref={profileRef}>
                 <button
  onClick={() => setProfileOpen(prev => !prev)}
  className="
    flex items-center gap-3 px-2 py-2 pr-4
    rounded-2xl
    bg-white/5 backdrop-blur-xl
    border border-white/10

    hover:bg-white/10 hover:border-white/20
    active:scale-95

    transition-all duration-300 ease-out
    group
  "
>
  {/* Avatar */}
  <div className="relative">
    <div className="
      w-10 h-10 rounded-xl
      bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500
      flex items-center justify-center
      text-white font-bold text-sm
      shadow-lg shadow-indigo-500/25

      group-hover:scale-105
      transition-transform duration-300
    ">
      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
    </div>

    {/* Online status */}
    <span className="
      absolute -bottom-1 -right-1
      w-3 h-3 rounded-full
      bg-emerald-400
      border-2 border-slate-900
      shadow-[0_0_6px_rgba(16,185,129,0.8)]
    " />
  </div>

  {/* User Info */}
  <div className="text-left hidden lg:block leading-tight">
    <p className="text-xs font-semibold text-white truncate max-w-[120px]">
      {profileDisplayName}
    </p>
    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
      {user?.role || "Active"}
    </p>
  </div>

  {/* Dropdown Icon */}
  <ChevronDown
    className={`
      w-4 h-4 text-slate-400
      transition-all duration-300
      group-hover:text-white
      ${profileOpen ? "rotate-180" : ""}
    `}
  />
</button>
{profileOpen && (
  <div className="absolute right-0 top-full mt-3 w-72 bg-slate-900 border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">

    {/* HEADER */}
    <div className="px-5 py-4 border-b border-white/10 bg-white/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {profileDisplayName}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
          {user?.role} active
        </span>
      </div>
    </div>

    {/* Navigation moved to dashboard sidebars (keep logout below). */}

    {/* LOGOUT ALWAYS SHOWN */}
    <div className="p-2 border-t border-white/5">
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
      >
        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Logout</span>
      </button>
    </div>

  </div>
)}
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all cursor-pointer whitespace-nowrap"
                >
                  Terminate <span className="opacity-40">Session</span>
                </button>
              )
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
          {isDashboard && (
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
        <div className="md:hidden border-t border-border bg-bg/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {visibleLinks.map(link => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isNavLinkActive(link.path)
                  ? "bg-primary/20 text-primary border border-primary/20"
                  : "text-text/70 hover:text-text hover:bg-white/5"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-text/40 mb-3">Switch Theme</p>
            <ThemeSwitcher />
          </div>

          <div className="border-t border-border pt-3 mt-3 space-y-2">
            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
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
                      ? "bg-gradient-to-r from-primary to-secondary text-white"
                      : "text-text/70 hover:text-text hover:bg-white/5"
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