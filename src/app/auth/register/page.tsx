"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.role) {
      alert("All fields including role are required");
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
      console.error("Error registering user:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-600 via-pink-500 to-red-500">
      <form
        onSubmit={handleSubmit}
        className="p-8 shadow-2xl rounded-3xl w-96 bg-white/90 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-700 animate-pulse">
          Create Your Account
        </h2>

        {/* Name */}
        <label htmlFor="name" className="sr-only">Name</label>
        <input
          id="name"
          type="text"
          placeholder="Name"
          className="w-full mb-4 p-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all shadow-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Email */}
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all shadow-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* Password */}
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all shadow-sm"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* Role */}
        <label htmlFor="role" className="sr-only">Role</label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full mb-6 p-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all shadow-sm"
        >
          <option value="">Select Role</option>
          <option value="ADMIN">Admin</option>
          <option value="STATION">Station</option>
          <option value="DRIVER">Driver</option>
        </select>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded-xl font-bold text-white text-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 hover:scale-105 shadow-lg"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}