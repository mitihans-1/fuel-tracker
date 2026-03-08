"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include", // ✅ important: store HTTP-only cookie
      });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Server returned invalid response");
        setLoading(false);
        return;
      }

      if (res.ok) {
        // Role-based redirect
        if (data.role === "DRIVER") router.push("/dashboard/driver");
        else if (data.role === "STATION") router.push("/dashboard/station");
        else if (data.role === "ADMIN") router.push("/dashboard/admin");
        else router.push("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-purple-700 via-pink-500 to-red-500 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-96 p-10 bg-white/90 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl flex flex-col gap-4"
      >
        <h2 className="text-3xl font-extrabold text-center text-purple-700 animate-pulse mb-6">
          Welcome Back
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full p-3 rounded-xl border border-gray-300 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 shadow-sm transition-all"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, password: e.target.value }))
          }
          className="w-full p-3 rounded-xl border border-gray-300 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 shadow-sm transition-all"
        />

        <button
          type="submit"
          disabled={loading}
          className={`p-3 rounded-xl font-bold text-white text-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-lg"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-2">
          Don’t have an account?{" "}
          <a
            href="/auth/register"
            className="text-purple-600 font-semibold hover:underline"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}