"use client";

import React, { useState, FormEvent, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement | null,
            options: {
              theme?: string;
              size?: string;
              width?: string;
              shape?: string;
              text?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleGoogleLogin = useCallback(async (response: { credential?: string }) => {
    setLoading(true);
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: response.credential }),
      credentials: "include",
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Google login failed");
      setLoading(false);
    }
  }, [router]);

  const googleInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || googleInitializedRef.current) return;

    const scriptId = "google-client-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initGoogle = () => {
      if (!window.google || googleInitializedRef.current) return;
      googleInitializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id:
          "678586604246-o3oms8le08dt87ibe80q0s4e3iqcjo9m.apps.googleusercontent.com",
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
          theme: "outline",
          size: "large",
          width: "192",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
        }
      );
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [handleGoogleLogin]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password || !verified) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setLoading(false);
        return;
      }

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-80px)] flex items-start sm:items-center justify-center py-10 px-4 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 relative">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl text-white text-3xl mb-4 shadow-xl shadow-blue-500/30">
            ⛽
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white">
            Welcome back
          </h2>
          <p className="text-blue-100/70 font-medium italic">
            Access your FuelSync console
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Email Address
              </label>
              <input
              title="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
              <p className="mt-1 text-[11px] text-blue-200/70">
                Please enter a valid email address you can access.
              </p>
            </div>

            <div>
              <label className="text-[13px] font-black uppercase tracking-widest ml-4 mb-2 block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Password
              </label>
              <input
              title="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" />
              <p className="mt-1 text-[11px] text-blue-200/70">
                Use at least 8 characters. Avoid reusing passwords from other sites.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <input
              id="login-verify"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
              required
            />
            <label
              htmlFor="login-verify"
              className="text-[11px] text-blue-100/80"
            >
              I confirm that my email and password are correct and I’m using this device in a safe place.
            </label>
          </div>

          <div className="flex flex-col items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !verified}
              className={` cursor-pointer w-48 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${loading
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.8)]"
                }`}
            >
              {loading ? "Authenticating..." : "✦ Sign In"}
            </button>

            <div className="flex items-center w-full max-w-[200px] gap-3 py-2">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-[10px] font-black text-blue-200/40 uppercase tracking-[0.2em]">OR</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div id="googleBtn" className="w-48 flex justify-center"></div>
          </div>


          <div className="pt-4 text-center">
            <p className="text-xs font-bold text-green-300/70 uppercase tracking-widest flex items-center justify-center gap-2">
              🔒 Secure & Encrypted Connection
            </p>

          </div>
        </form>

        <p className="text-center text-sm font-bold text-blue-200/60 mt-8">
          New to the platform?{" "}
          <Link href="/auth/register" className="text-blue-300 hover:text-white hover:underline transition-colors">
            Register Account
          </Link>
        </p>

      </div>
    </div>
  );
}