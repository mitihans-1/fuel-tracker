"use client";
import React, { useState, useRef } from "react";
import ClientNavbar from "@/components/ClientNavbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ArrowRight, Github, Linkedin, Facebook } from "lucide-react";

export default function ContactPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setStatus({ type: "success", message: "Message sent successfully! We will get back to you soon." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setStatus({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: "+251 911 234 567",
      link: "tel:+251911234567",
      subDetails: "Mon-Fri from 8am to 6pm",
      color: "bg-blue-600",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: "support@fuelsync.com",
      link: "mailto:support@fuelsync.com",
      subDetails: "We'll respond within 24 hours",
      color: "bg-indigo-600",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: "Bole, Addis Ababa",
      link: "https://maps.google.com/?q=Bole,Addis+Ababa",
      subDetails: "Ethiopia, HQ Office",
      color: "bg-purple-600",
    },
  ];

  const socialLinks = [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/mitiku-etafa-a909803a8/", icon: <Linkedin className="w-4 h-4" /> },
    { name: "Facebook", url: "https://web.facebook.com/mitiku.etafa.865028", icon: <Facebook className="w-4 h-4" /> },
    { name: "Github", url: "https://github.com/mitihans-1", icon: <Github className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen text-slate-900 bg-white selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      <ClientNavbar />

      <div className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-24">
        {/* HERO */}
        <section className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-slate-900 leading-tight tracking-tight"
          >
            Contact Our <span className="text-indigo-600">Team</span>
          </motion.h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed font-medium">
            Have questions about FuelSync? We&apos;re here to help you optimize your refueling operations.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-[2.5rem] p-8 bg-slate-50 border border-slate-200 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full" />
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Get in Touch</h3>
              <p className="text-slate-600 text-sm mb-8 font-medium leading-relaxed">
                Whether you&apos;re a driver looking for fuel or a station owner wanting to join our network, our team is ready to assist you.
              </p>

              <div className="space-y-8">
                {contactInfo.map((info, idx) => (
                  <motion.a
                    key={idx}
                    href={info.link}
                    target={info.link.startsWith("http") ? "_blank" : undefined}
                    rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4 group"
                  >
                    <div className={`p-3 rounded-2xl ${info.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{info.title}</p>
                      <p className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{info.details}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{info.subDetails}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-slate-200">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Connect With Us</p>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-slate-200"
                      title={social.name}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2" ref={formRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Send a Message</h3>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">Protocol Response Unit</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-400 resize-none"
                  />
                </div>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-wider ${
                      status.type === "success" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {status.message}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Execute Transmission
                      <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Global Support Network Map (Decorative) */}
        <div className="mt-20">
          <div className="rounded-[3rem] p-12 bg-slate-50 border border-slate-200 text-slate-900 relative overflow-hidden text-center shadow-sm">
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <Globe className="absolute -bottom-20 -right-20 w-96 h-96 text-indigo-900" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-900">Fueling Progress Across Ethiopia</h3>
              <p className="text-slate-600 max-w-xl mx-auto text-sm font-medium leading-relaxed mb-8">
                Our support network is expanding daily. If you&apos;re a fuel station owner in any region, reach out to join the most advanced refueling ecosystem.
              </p>
              <button 
                onClick={scrollToForm}
                className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 mx-auto"
              >
                Partner with us
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
