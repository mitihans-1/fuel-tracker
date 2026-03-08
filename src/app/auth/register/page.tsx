"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      alert("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Registration failed: ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      alert(data.message);
      router.push("/auth/login");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-tr from-purple-700 via-pink-500 to-red-500 py-10" >
      <form
        onSubmit={handleSubmit}
        className="p-10 w-96 bg-white/90 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl flex flex-col gap-4"
      >
        <h2 className="text-3xl font-extrabold text-center text-purple-700 animate-pulse mb-6">
          Create Your Account
        </h2>

        <input
          type="text"
          placeholder="Name"
          className="
    w-full mb-4 p-3 rounded-xl
    border border-gray-300
    bg-white/80 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500
    transition-all shadow-sm
  "
          value={form.name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setForm(prev => ({ ...prev, name: e.target.value }))
}
        />
<input
  type="email"
  placeholder="Email"
  value={form.email}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, email: e.target.value }))
  }
  className="
    w-full mb-4 p-3 rounded-xl
    border border-gray-300
    bg-white/80 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500
    transition-all shadow-sm
  "
/>

        <input
  type="password"
  placeholder="Password"
  value={form.password}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, password: e.target.value }))
  }
  className="
    w-full mb-6 p-3 rounded-xl
    border border-gray-300
    bg-white/80 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500
    transition-all shadow-sm
  "
/>

        <select
        title="role"
  value={form.role}
  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, role: e.target.value }))
  }
  className="
    w-full mb-6 p-3 rounded-xl
    border border-gray-300
    bg-white/80 text-gray-900 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500
    transition-all shadow-sm
  "
>
          <option value="">Select Role</option>
          <option value="ADMIN">Admin</option>
          <option value="STATION">Station</option>
          <option value="DRIVER">Driver</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`p-3 rounded-xl font-bold text-white text-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-lg"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-2">
          Already have an account?{" "}
          <a href="/auth/login" className="text-purple-600 font-semibold hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}