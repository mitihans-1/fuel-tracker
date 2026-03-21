"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) {
      const fetchUser = async () => {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role);
          }
        } catch (err) {
          console.error("Navbar fetchUser error:", err);
        }
      };
      fetchUser();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserRole(null);
    }
  }, [isDashboard]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    setMenuOpen(false);
  };

  const coreLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  if (isDashboard && userRole === "STATION") {
    coreLinks.push({ name: "Inventory Management", path: "/dashboard/inventory" });
  }

  const marketingLinks = [
     { name: "How It Works", path: "/#features" },
  // { name: "Support", path: "/#support" },
  // { name: "Contact", path: "/#contact" },
  ];
  const authLinks = [
  {name : "Register",path: "/auth/register"},
  ] ;

  const visibleLinks = isDashboard ? coreLinks : [...coreLinks,...marketingLinks];

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
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-sm font-bold">
              {visibleLinks.map((link)=>(
              <Link
                key={link.path}
                href={link.path}
                className={`transition-colors ${pathname === link.path
                    ? "text-blue-400"
                    : "text-white/60 hover:text-white"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-5 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            {isDashboard ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all cursor-pointer"
              >
                Logout
              </button>
            ) : (
              authLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${pathname === link.path
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

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            // X icon
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-2">
            {visibleLinks.map((link)=>(
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === link.path
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
              authLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === link.path
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
