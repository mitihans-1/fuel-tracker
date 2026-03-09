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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  const authLinks = [
    { name: "Login", path: "/auth/login" },
    { name: "Register", path: "/auth/register" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
            ⛽
          </div>
          <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent uppercase">
            Fuel<span className="text-indigo-600">Sync</span>
          </h1>
        </Link>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-sm font-bold">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`transition-colors hover:text-indigo-600 ${pathname === link.path ? 'text-indigo-600' : 'text-gray-500 opacity-70 hover:opacity-100'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-100" />

          <div className="flex items-center gap-4">
            {pathname && pathname.startsWith("/dashboard") ? (
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-gray-50 text-gray-800 text-xs font-black uppercase tracking-widest rounded-xl border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-3">
                 {authLinks.map(link => (
                   <Link 
                     key={link.path} 
                     href={link.path}
                     className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                       pathname === link.path 
                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                       : 'text-gray-500 hover:bg-gray-50'
                     }`}
                   >
                     {link.name}
                   </Link>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}