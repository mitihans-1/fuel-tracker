"use client";

import React from "react";
import ClientNavbar from "@/components/ClientNavbar";
import {
  Target,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  BarChart3,
  HeartHandshake,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Strategic Accuracy",
      desc: "Real-time fuel availability insights across stations to support smarter decisions.",
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      icon: ShieldCheck,
      title: "Digital Integrity",
      desc: "Secure, transparent systems that build trust between users and fuel providers.",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      icon: Zap,
      title: "Operational Speed",
      desc: "Reducing waiting time through intelligent queue and supply optimization.",
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
  ];

  return (
    <main className="min-h-screen text-slate-900 bg-white selection:bg-indigo-500/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      <ClientNavbar />

      <div className="relative z-10 pt-28 pb-24 max-w-6xl mx-auto px-6 space-y-28">

        {/* HERO */}
        <section className="text-center space-y-8">
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight">
            Smarter Fuel Distribution <br />
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Built for Ethiopia
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            FuelSync connects drivers, stations, and logistics through real-time data,
            reducing inefficiencies and improving accessibility across the fuel ecosystem.
          </p>
        </section>

        {/* VALUES */}
        <section className="grid md:grid-cols-3 gap-8">
          {values.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="rounded-[2rem] p-8 bg-slate-50 border border-slate-200 hover:border-indigo-500/30 transition shadow-sm hover:shadow-xl"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl border mb-6 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-3">
                {item.title}
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </section>

        {/* WHY SECTION */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Why FuelSync Exists
            </h2>

            <p className="text-slate-600 leading-relaxed font-medium">
              Fuel distribution inefficiencies often result in long queues, wasted time,
              and poor visibility across stations. FuelSync addresses these challenges
              by providing real-time insights and better coordination tools.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: BarChart3,
                  title: "Data Insights",
                  desc: "Stations can optimize supply using real-time analytics.",
                },
                {
                  icon: Globe,
                  title: "Scalable",
                  desc: "Designed to expand across all regions in Ethiopia.",
                },
                {
                  icon: HeartHandshake,
                  title: "User Focused",
                  desc: "Built around real feedback from drivers and stations.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
                  <item.icon className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <h4 className="text-slate-900 font-bold">{item.title}</h4>
                    <p className="text-sm text-slate-600 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATS CARD */}
          <div className="rounded-[3rem] p-12 bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <p className="text-xs uppercase tracking-[0.3em] font-black text-indigo-100 mb-4">
              Platform Impact
            </p>

            <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">
              Real-Time Growth
            </h3>

            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="space-y-1">
                <p className="text-4xl md:text-5xl font-black">450+</p>
                <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest">Active Stations</p>
              </div>
              <div className="space-y-1">
                <p className="text-4xl md:text-5xl font-black">250K+</p>
                <p className="text-[10px] text-indigo-100 font-black uppercase tracking-widest">Transactions</p>
              </div>
            </div>
          </div>

        </section>

        {/* CTA */}
        <section className="text-center space-y-8 py-12">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
            Start using FuelSync today
          </h2>

          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              href="/auth/register"
              className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="px-10 py-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 transition-all text-slate-900 font-black uppercase tracking-widest text-xs active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}