"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Fuel, Zap,
  Award, Clock, Linkedin, Facebook, Instagram, Github,
  Truck, Star, ArrowRight
} from "lucide-react";

const slides = [
  {
    title: ["Find", "Fuel.", "Skip", "the", "Line."],
    // subtitle: "⚡ Real-time fuel availability across all stations in Ethiopia",
    description: "Join thousands of drivers using digital queuing to save hours at the pump. Real-time tracking for Benzene, Nafta, and Premium fuels.",
    primaryCTA: "Start Free Trial",
    secondaryCTA: "Explore Platform",
    image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1920",
    color: "from-blue-600 to-indigo-600"
  },
  {
    title: ["Smart", "Station", "Explorer"],
    // subtitle: "🗺️ Interactive maps with live stock updates",
    description: "Navigate to the nearest open station with guaranteed stock. View queue lengths and estimated wait times before you leave home.",
    primaryCTA: "View Map",
    secondaryCTA: "Station List",
    image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1920",
    color: "from-emerald-600 to-teal-600"
  },
  {
    title: ["Secure", "Digital", "Payments"],
    // subtitle: "📱 Contactless transactions & wallet management",
    description: "Pay seamlessly with Chapa, TeleBirr, or your FuelSync wallet. Secure, transparent pricing with digital receipts for every fill-up.",
    primaryCTA: "Get Started",
    secondaryCTA: "Pricing Info",
    image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1920",
    color: "from-purple-600 to-indigo-600"
  }
];





export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [activeSlide, setActiveSlide] = useState(0);

  // Products Section State
  const [petrol, setPetrol] = useState(false);
  const [diesel, setDiesel] = useState(false);
  const [petrolPrice, setPetrolPrice] = useState(80);
  const [dieselPrice, setDieselPrice] = useState(75);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [isStationOwner, setIsStationOwner] = useState(false);

  useEffect(() => {
    const fetchDataForStation = async () => {
      try {
        const statusRes = await fetch("/api/stations/me");
        if (!statusRes.ok) return;
        const data = await statusRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const currentStation = data[0];
          setIsStationOwner(true);
          setPetrol(!!currentStation.petrol);
          setPetrolPrice(currentStation.petrolPrice ?? 80);
          setDiesel(!!currentStation.diesel);
          setDieselPrice(currentStation.dieselPrice ?? 75);
          setAvgRating(currentStation.rating || null);
          setRatingCount(currentStation.ratingCount || 0);
        }
      } catch {}
    };
    if (user) fetchDataForStation();
  }, [user]);

  const handleAction = (path) => {
    if (user) {
      router.push(isStationOwner ? path : "/dashboard");
    } else {
      const isReturning = localStorage.getItem("fuel_sync_returning_user") === "true";
      if (isReturning) {
        router.push("/auth/login");
      } else {
        router.push("/auth/register");
      }
    }
  };

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="flex flex-col w-full bg-[#0a0f25] text-white">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center">

        {/* Background Images with AnimatePresence */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${slides[activeSlide].image}')` }}
            >
              {/* Cinematic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#070b1e]/90 via-[#070b1e]/70 to-[#070b1e]/95" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global UI Elements */}
        <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                  {slides[activeSlide].subtitle}
                </span>
              </motion.div>

                   <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                {slides[activeSlide].title.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.2, duration: 0.6 }}
                    className={`inline-block mr-4 ${i >= 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent' : ''}`}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <p className="max-w-2xl text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
                {slides[activeSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className={`group relative px-10 py-4 bg-gradient-to-r ${slides[activeSlide].color} text-white font-bold rounded-2xl shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-all`}
                >
                  <span className="flex items-center gap-2">
                    {slides[activeSlide].primaryCTA}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="#features"
                  className="px-10 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  {slides[activeSlide].secondaryCTA}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The "Three Points" Pagination dots at the bottom */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className="group relative p-3"
            >
              <div
                className={`h-1.5 transition-all duration-500 rounded-full ${activeSlide === i
                  ? "w-10 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
                  : "w-1.5 bg-white/30 group-hover:bg-white/50"
                  }`}
              />
            </button>
          ))}
        </div>

        {/* Slide Indicator Text (Small) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
          Slide 0{activeSlide + 1} / 0{slides.length}
        </div>
      </section>

     {/* Stats Section */}
<section className="relative py-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50">

  {/* Soft radial glow (lighter version) */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.08)_0%,transparent_70%)]" />

  <div className="max-w-7xl mx-auto px-6 relative">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

      {[
        { label: "Active Drivers", value: "10,000+", icon: <Zap className="text-blue-500" /> },
        { label: "Fuel Stations", value: "450+", icon: <Fuel className="text-indigo-500" /> },
        { label: "Queue Reduction", value: "65%", icon: <Clock className="text-emerald-500" /> },
        { label: "Total Transactions", value: "250K+", icon: <Award className="text-amber-500" /> },
      ].map((stat, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -5 }}
          className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md hover:shadow-lg transition flex flex-col items-center text-center space-y-3"
        >
          {/* Icon */}
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">
            {stat.icon}
          </div>

          {/* Value */}
          <div className="text-3xl font-black text-slate-900">
            {stat.value}
          </div>

          {/* Label */}
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {stat.label}
          </div>
        </motion.div>
      ))}

    </div>
  </div>
</section>
<section
  id="features"
  className="py-32 bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden"
>
  {/* Background Glow */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full" />
  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full" />

  {/* Grid Pattern */}
  <div className="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

  <div className="max-w-7xl mx-auto px-6 relative z-10">

    {/* Header */}
    <div className="text-center mb-24 space-y-6">
      <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
        Strategic{" "}
        <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
          Protocol
        </span>
      </h2>

      <p className="text-slate-500 max-w-xl mx-auto text-sm font-semibold tracking-widest uppercase">
        Platform workflow synchronization & milestones
      </p>
    </div>

    {/* GRID LAYOUT */}
    <div className="grid md:grid-cols-3 gap-10">

      {[
        {
          title: "Monitor Intelligence",
          desc: "Analyze real-time fuel grid telemetry with advanced tracking.",
          color: "blue",
        },
        {
          title: "Strategic Deployment",
          desc: "Secure your queue position with smart automation.",
          color: "indigo",
        },
        {
          title: "Resource Acquisition",
          desc: "Execute fast, secure and seamless transactions.",
          color: "emerald",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          {/* Glow */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 bg-${item.color}-400/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition`} />

          {/* Step Number */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-black text-slate-400 tracking-widest">
              0{i + 1}
            </span>
            <div className={`w-2 h-2 rounded-full bg-${item.color}-500 animate-pulse`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed">
            {item.desc}
          </p>

          {/* Bottom Accent Line */}
          <div className="mt-8 h-[2px] w-10 bg-slate-200 group-hover:w-20 group-hover:bg-indigo-500 transition-all duration-300" />
        </div>
      ))}
    </div>

    {/* OPTIONAL: CONNECTING LINE (visual flow) */}
    {/* <div className="hidden md:block absolute top-[55%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-200 to-transparent" /> */}

  </div>
</section>

{/* Integrated Products Section */}
<section className="py-32 bg-slate-50 relative overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[140px] rounded-full" />
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
    <div className="text-center space-y-4">
      <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight">
        Fuel <span className="text-indigo-600">Solutions</span>
      </h2>
      <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
        Real-time inventory tracking, digital queue management, and customer trust signals for Ethiopia`s modern energy grid.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Petrol Card */}
      <article className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <Fuel className="w-7 h-7" />
          </div>
          {user && isStationOwner && (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${petrol ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              {petrol ? "Available" : "Out of Stock"}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Premium Petrol</h3>
        <p className="mt-3 text-slate-500 font-medium leading-relaxed">
          Real-time Benzene inventory management for station owners and live availability for private vehicle drivers.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Market</span>
            <span className="text-lg font-black text-slate-900">{isStationOwner ? petrolPrice : "80+" } ETB/L</span>
          </div>
          <button
            onClick={() => handleAction("/dashboard/inventory")}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-xs font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
          >
            {isStationOwner ? "Update Inventory" : "View Near Me"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* Diesel Card */}
      <article className="w-100 h-130 group p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Truck className="w-7 h-7" />
          </div>
          {user && isStationOwner && (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${diesel ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
              {diesel ? "Available" : "Out of Stock"}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Heavy Diesel</h3>
        <p className="mt-3 text-slate-500 font-medium leading-relaxed">
          Efficient Nafta distribution tracking optimized for commercial fleets, logistics, and heavy transport.
        </p>
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Market</span>
            <span className="text-lg font-black text-slate-900">{isStationOwner ? dieselPrice : "75+" } ETB/L</span>
          </div>
          <button
            onClick={() => handleAction("/dashboard/inventory")}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-4 text-xs font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            {isStationOwner ? "Update Inventory" : "View Near Me"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* Reputation Card */}
      <article className="group p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
            <Star className="w-7 h-7" />
          </div>
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
            Reputation
          </span>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Customer Trust</h3>
        <p className="mt-3 text-slate-500 font-medium leading-relaxed">
          Transparent rating systems that help reliable stations stand out and drivers find the best service quality.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Average</p>
            <p className="text-lg font-black text-slate-900">{isStationOwner && avgRating !== null ? avgRating.toFixed(1) : "4.8"} / 5.0</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Verified</p>
            <p className="text-lg font-black text-slate-900">{isStationOwner ? ratingCount : "500+"}</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-500 font-medium italic text-center">
          Verified reviews help build community trust
        </p>
      </article>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="py-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50 border-t border-slate-200 pb-5">

  <div className="max-w-7xl mx-auto px-6 ">

    {/* TOP GRID */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

      {/* BRAND */}
      <div className="col-span-1 md:col-span-2 space-y-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-md">
            ⛽
          </div>
          <span className="font-black text-2xl tracking-tight text-slate-900">
            FuelSync
          </span>
        </Link>

        <p className="text-slate-600 max-w-sm font-medium leading-relaxed">
          Modernizing Ethiopia’s energy distribution network. For drivers who
          value their time and stations who value their customers.
        </p>
      </div>

      {/* RESOURCES */}
      <div>
        <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">
          Resources
        </h4>

        <ul className="space-y-4 text-sm font-medium text-slate-600">
          <li><Link href="documentation" className="hover:text-indigo-600 transition">Documentation</Link></li>
          <li><Link href="stations" className="hover:text-indigo-600 transition">Station Portal</Link></li>
          <li><Link href="api-keys" className="hover:text-indigo-600 transition">API Keys</Link></li>
        </ul>
      </div>

      {/* LEGAL */}
      <div>
        <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">
          Legal
        </h4>

        <ul className="space-y-4 text-sm font-medium text-slate-600">
          <li><Link href="privacy" className="hover:text-indigo-600 transition">Privacy Policy</Link></li>
          <li><Link href="terms" className="hover:text-indigo-600 transition">Terms of Service</Link></li>
          <li><Link href="support" className="hover:text-indigo-600 transition">Contact Support</Link></li>
        </ul>
      </div>
    </div>

    {/* BOTTOM BAR */}
    <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-200 gap-6">

      <p className="text-slate-500 text-xs">
        © 2026 FuelSync Ethiopia. All rights reserved.
      </p>

      {/* SOCIAL ICONS */}
      <div className="flex gap-2">

      {[
  {
    Icon: Linkedin,
    url: "https://www.linkedin.com/in/mitiku-etafa-a909803a8/",
    hover: "hover:bg-green-600 hover:text-white",
    active: "active:bg-blue-700 active:scale-95"
  },
  {
    Icon: Facebook,
    url: "https://web.facebook.com/mitiku.etafa.865028",
    hover: "hover:bg-blue-600 hover:text-white",
    active: "active:bg-blue-700 active:scale-95"
  },
  {
    Icon: Instagram,
    url: "https://www.instagram.com/mitihans22/",
    hover: "hover:bg-pink-600 hover:text-white",
    active: "active:bg-pink-700 active:scale-95"
  },
  {
    Icon: Github,
    url: "https://github.com/mitihans-1",
    hover: "hover:bg-slate-900 hover:text-white",
    active: "active:bg-slate-800 active:scale-95"
  },
].map(({ Icon, url, hover, active }, idx) => (
  <Link
    key={idx}
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      w-11 h-11 rounded-full
      border border-slate-200
      bg-white
      flex items-center justify-center

      text-slate-500

      transition-all duration-300 ease-out

      hover:scale-110 hover:shadow-md
      ${hover}
      ${active}
    `}
  >
    <Icon className="w-5 h-5 transition-colors duration-300" />
  </Link>
))}

      </div>
    </div>

  </div>
</footer>
    </div>
  );
}