"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Fuel, Wallet, TrendingUp, Clock, CheckCircle,
  Star, Bell, CreditCard,
  AlertCircle, Navigation, Zap, Shield, Award,
  Gauge,
  TrendingDown, LayoutDashboard, History, Car, Settings, LogOut, Menu, Activity
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Station } from "./OSMMap";

const OSMMap = dynamic(() => import("@/components/OSMMap"), { ssr: false });

import { formatDateTime } from "@/lib/utils";

interface FuelRequest {
  _id: string;
  stationId: { name: string; location?: string };
  fuelType: string;
  status: string;
  amount?: number;
  totalPrice?: number;
  paymentStatus?: string;
  createdAt?: string;
}

interface PendingTicket {
  stationName: string;
  stationLocation: string;
  stationRating?: number;
  stationRatingCount?: number;
  queueLength?: number;
  estimatedWait?: number;
  fuelType: "petrol" | "diesel";
  litres: number;
  pricePerLitre: number;
  total: number;
}

const PAGE_SIZE = 6;

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

// Enhanced Toast Component
const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${t.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
              : t.type === "error"
                ? "bg-red-500/20 border-red-400/30 text-red-200"
                : "bg-indigo-500/20 border-indigo-400/30 text-indigo-200"
              }`}
          >
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
            <span className="flex-1">
              {typeof t.message === 'string' ? t.message : JSON.stringify(t.message)}
            </span>
            <button
              onClick={() => onDismiss(t.id)}
              className="ml-2 opacity-60 hover:opacity-100 transition"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Confirm Modal
const ConfirmModal = ({ open, title, message, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 mx-auto">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2 text-white">{title}</h3>
        <p className="text-sm text-slate-400 text-center mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            className="px-5 py-2.5 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all font-medium"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium transition-all shadow-lg"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export interface FullStation extends Station {
  petrol: boolean;
  diesel: boolean;
  petrolQty?: number;
  dieselQty?: number;
  petrolPrice?: number;
  dieselPrice?: number;
  queueLength?: number;
  estimatedWaitMinutes?: number;
  avgRating?: number;
  ratingCount?: number;
}

interface FuelAlertSubscription {
  _id: string;
  fuelType: "petrol" | "diesel";
  active: boolean;
}

// Enhanced Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  trend?: "up" | "down";
  trendValue?: string;
}

const StatCard = ({ icon: Icon, label, value, color, trend, trendValue }: StatCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 blur-[60px] rounded-full" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
    </div>
  </motion.div>
);

export default function DriverDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stations, setStations] = useState<FullStation[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Station | null>(null);
  const [checkoutStation, setCheckoutStation] = useState<FullStation | null>(null);
  const [checkoutFuelType, setCheckoutFuelType] = useState<"petrol" | "diesel" | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<number>(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletCurrency, setWalletCurrency] = useState<string>("ETB");
  const [walletLoading, setWalletLoading] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [ratingStationId, setRatingStationId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ticketData, setTicketData] = useState<PendingTicket | null>(null);
  const [fuelAlertEnabled, setFuelAlertEnabled] = useState<{
    petrol: boolean;
    diesel: boolean;
  }>({ petrol: false, diesel: false });
  const [notifications, setNotifications] = useState<
    { _id: string; title: string; message: string; read: boolean; createdAt?: string }[]
  >([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // Tactical parameter observation
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "register") {
      setShowAddStation(true);
      // Clear parameter to prevent re-opening
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const [showAddStation, setShowAddStation] = useState(false);
  const [stationForm, setStationForm] = useState({ name: '', location: '' });
  const [stationRegisterLoading, setStationRegisterLoading] = useState(false);

  const handleRegisterStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setStationRegisterLoading(true);
    try {
      const res = await fetch("/api/stations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationName: stationForm.name, stationLocation: stationForm.location })
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("Station registered! Reloading dashboard...", "success");
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      showToast("Failed to register station", "error");
    } finally {
      setStationRegisterLoading(false);
    }
  };

  const view = (searchParams.get("tab") as "dashboard" | "logs" | "vehicles" | "settings") || "dashboard";

  const setView = (v: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", v);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const sidebarOpen = false; // Sidebar removed, but keeping state-like variable if needed for logic

  const sidebarItems: { id: "dashboard" | "logs" | "vehicles" | "settings"; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "logs", label: "Fuel Logs", icon: <History className="w-5 h-5" /> },
    { id: "vehicles", label: "My Vehicles", icon: <Car className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];
  const toastId = useRef(0);
  const showToast = useCallback((msg: string | { error?: string; message?: string } | unknown, type: Toast["type"] = "info") => {
    const id = ++toastId.current;
    const message = typeof msg === 'string' 
      ? msg 
      : ((msg as { error?: string })?.error || (msg as { message?: string })?.message || (typeof msg === 'object' ? JSON.stringify(msg) : String(msg)));
    
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch wallet
  useEffect(() => {
    const loadWallet = async () => {
      try {
        setWalletLoading(true);
        const res = await fetch("/api/wallet/me");
        if (!res.ok) {
          throw new Error("Failed to load wallet");
        }
        const data = await res.json();
        setWalletBalance(typeof data.balance === "number" ? data.balance : 0);
        if (data.currency) setWalletCurrency(data.currency);
      } catch {
        setWalletBalance(null);
      } finally {
        setWalletLoading(false);
      }
    };
    loadWallet();
  }, []);

  // Load alert subscriptions and notifications
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const [subsRes, notifRes] = await Promise.all([
          fetch("/api/alerts/subscriptions"),
          fetch("/api/alerts/notifications"),
        ]);

        if (subsRes.ok) {
          const subs: FuelAlertSubscription[] = await subsRes.json();
          const petrol = subs.some(s => s.fuelType === "petrol" && s.active);
          const diesel = subs.some(s => s.fuelType === "diesel" && s.active);
          setFuelAlertEnabled({ petrol, diesel });
        }

        if (notifRes.ok) {
          const list = await notifRes.json();
          setNotifications(list);
        }
      } catch {
        // ignore
      }
    };
    loadAlerts();
  }, []);

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const res = await fetch(`/api/stations/with-queue`);
        if (!res.ok) throw new Error("Failed to fetch stations");
        const data = await res.json();
        if (Array.isArray(data)) {
          setStations(data);
        } else {
          setStations([]);
        }
      } catch {
        setError("Could not load stations");
      } finally {
        setLoadingStations(false);
      }
    };
    const t = setTimeout(fetchStations, 200);
    return () => clearTimeout(t);
  }, [page, searchQuery]);

  // Fetch driver requests
  const loadRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/request/driver");
      if (!res.ok) throw new Error("Failed to load requests");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch {
      showToast("Failed to load your requests", "error");
    } finally {
      setLoadingRequests(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Handle return from Chapa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      window.history.replaceState({}, "", "/dashboard");
      const stored = sessionStorage.getItem("pendingTicket");
      if (stored) {
        sessionStorage.removeItem("pendingTicket");
        try { setTicketData(JSON.parse(stored)); } catch { /* ignore */ }
      } else {
        showToast("Payment successful! Your fuel request has been submitted.", "success");
      }
      loadRequests();
    }
    if (params.get("wallet_payment") === "success") {
      const tx_ref = params.get("tx_ref");
      window.history.replaceState({}, "", "/dashboard");
      if (tx_ref) {
        fetch(`/api/payment/chapa/wallet-verify?tx_ref=${tx_ref}`)
          .then(r => r.json())
          .then(d => {
            if (d.verified) {
              showToast("Wallet topped up successfully!", "success");
              fetch("/api/wallet/me").then(r => r.json()).then(w => {
                if (typeof w.balance === "number") setWalletBalance(w.balance);
              }).catch(() => { });
            }
          }).catch(() => { });
      }
    }
  }, [showToast, loadRequests]);

  const handleTopUp = async () => {
    if (!topUpAmount || topUpAmount <= 0) return;
    setTopUpLoading(true);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topUpAmount }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Failed to initialize top-up", "error"); return; }
      window.location.href = data.checkout_url;
    } catch {
      showToast("Error initializing top-up", "error");
    } finally {
      setTopUpLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    const es = new EventSource("/api/request/station/stream");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) {
          setStations(data);
        } else {
          setStations([]);
        }
      } catch {
        // ignore
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const startCheckout = (station: FullStation, fuelType: "petrol" | "diesel") => {
    setCheckoutStation(station);
    setCheckoutFuelType(fuelType);
    setCheckoutAmount(1);
  };

  const handlePayment = async () => {
    if (!checkoutStation || !checkoutFuelType) return;
    setIsProcessingPayment(true);
    try {
      const pricePerLitre = checkoutFuelType === "petrol"
        ? (checkoutStation.petrolPrice ?? 80)
        : (checkoutStation.dieselPrice ?? 75);
      const totalPrice = checkoutAmount * pricePerLitre;

      const res = await fetch("/api/payment/chapa/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          fuelType: checkoutFuelType,
          stationId: checkoutStation._id,
          stationName: checkoutStation.name,
          litres: checkoutAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Payment init failed", "error");
        return;
      }

      const locationText = typeof checkoutStation.location === "string"
        ? checkoutStation.location
        : checkoutStation.location?.text ?? "";
      const ticketInfo: PendingTicket = {
        stationName: checkoutStation.name,
        stationLocation: locationText,
        stationRating: checkoutStation.avgRating,
        stationRatingCount: checkoutStation.ratingCount,
        queueLength: checkoutStation.queueLength,
        estimatedWait: checkoutStation.estimatedWaitMinutes,
        fuelType: checkoutFuelType,
        litres: checkoutAmount,
        pricePerLitre,
        total: totalPrice,
      };
      sessionStorage.setItem("pendingTicket", JSON.stringify(ticketInfo));

      window.location.href = data.checkout_url;
    } catch {
      showToast("Error initializing payment", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openCancelConfirm = (id: string) => {
    setCancelId(id);
    setConfirmOpen(true);
  };

  const cancelRequest = async (id: string) => {
    if (!id) return;
    setConfirmOpen(false);
    setMutatingId(id);
    const prev = requests;
    setRequests((r) => r.map((x) => (x._id === id ? { ...x, status: "CANCELED" } : x)));
    try {
      const res = await fetch(`/api/request/driver/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel");
      const data = await res.json();
      if (data && data.request) {
        setRequests((r) => r.map((x) => (x._id === id ? data.request : x)));
        showToast("Request canceled", "success");
      } else {
        await loadRequests();
        showToast("Request canceled", "success");
      }
    } catch {
      setRequests(prev);
      showToast("Failed to cancel request", "error");
    } finally {
      setMutatingId(null);
      setCancelId(null);
    }
  };

  const openRemoveConfirm = (id: string) => {
    setRemoveId(id);
    setRemoveConfirmOpen(true);
  };

  const removeRequest = async (id: string) => {
    if (!id) return;
    setRemoveConfirmOpen(false);
    setMutatingId(id);
    try {
      const res = await fetch("/api/request/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== id));
        showToast("Record removed from history", "success");
      } else {
        showToast("Failed to remove record", "error");
      }
    } catch {
      showToast("Error removing record", "error");
    } finally {
      setMutatingId(null);
    }
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeStations = Array.isArray(stations) ? stations : [];

  const filteredStations = safeStations.filter((s) => {
    const nameMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const locationText = typeof s.location === 'string' ? s.location : s.location?.text || '';
    const locationMatch = locationText.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || locationMatch;
  });

  const stats = {
    totalRequests: safeRequests.length,
    pendingCount: safeRequests.filter((r) => r.status === "PENDING").length,
    approvedCount: safeRequests.filter((r) => r.status === "APPROVED").length,
  };

  const spendingStats = {
    totalTickets: safeRequests.filter((r) => r.status === "APPROVED").length,
    lastTicketFuel: safeRequests.filter((r) => r.status === "APPROVED").slice(-1)[0]?.fuelType ?? null,
  };

  const recommendedStation = filteredStations.find(
    (s) => (s.petrol || s.diesel) && (s.petrolQty ?? 0) + (s.dieselQty ?? 0) > 0
  ) ?? filteredStations[0];

  const totalPages = Math.max(1, Math.ceil(filteredStations.length / PAGE_SIZE));
  const paginatedStations = filteredStations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 flex flex-col overflow-hidden">
      {/* Sidebar removed */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Mobile Header Removed */}

        {/* Soft gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-indigo-50/30 pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-10 space-y-10">
          <AnimatePresence mode="wait">
            {view === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
         <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-sky-100 via-white to-cyan-100/80 p-1 shadow-[0_30px_90px_-45px_rgba(14,116,144,0.55)]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-200/60 bg-gradient-to-br from-white/85 via-sky-50/95 to-cyan-50/90 px-6 py-8 sm:px-8 sm:py-10 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-sky-300/25 blur-3xl" />
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-300/30 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-indigo-200/30 blur-3xl" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col gap-8"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">

  {/* LEFT CONTENT */}
  <div className="max-w-2xl">
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] text-slate-900">
      FuelSync{" "}
      <span className="text-indigo-600 italic font-semibold">
        Driver
      </span>
    </h1>

    <p className="mt-5 max-w-xl text-base sm:text-lg leading-7 text-slate-600 font-medium">
      Discover nearby stations, request fuel faster, and track every trip from one clean and powerful dashboard.
    </p>
  </div>

  {/* RIGHT STATS */}
  <div className="grid w-full max-w-sm grid-cols-2 gap-4">

    {/* CARD 1 */}
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
        Network
      </p>

      <p className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">
        {safeStations.length}
      </p>

      <p className="text-sm font-medium text-slate-500">
        stations nearby
      </p>
    </div>

    {/* CARD 2 (ACCENT) */}
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm hover:shadow-md transition-all">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
        Ready Now
      </p>

      <p className="mt-3 text-3xl font-extrabold text-indigo-700 tracking-tight">
        {filteredStations.filter((s) => s.petrol || s.diesel).length}
      </p>

      <p className="text-sm font-medium text-indigo-600">
        stations live
      </p>
    </div>

  </div>
</div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={Fuel}
                  label="Total Requests"
                  value={stats.totalRequests}
                  color="indigo"
                  trend="up"
                  trendValue="+23%"
                />
                <StatCard
                  icon={Clock}
                  label="Pending"
                  value={stats.pendingCount}
                  color="amber"
                  trend="down"
                  trendValue="-5%"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Approved"
                  value={stats.approvedCount}
                  color="emerald"
                  trend="up"
                  trendValue="+12%"
                />
              </div>
            </motion.div>
          </div>
        </section>


        {/* Wallet & Insights Row */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
          className="group relative overflow-hidden bg-white/70 backdrop-blur-2xl rounded-[2rem] p-8 border border-slate-200/70 shadow-md hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/10 blur-[100px] rounded-full opacity-70 group-hover:opacity-100 transition" />
            <div className="relative flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-sm">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                {walletBalance !== null && (
                  <button
                    onClick={() => setShowTopUp(true)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
                    title="Add Funds"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-8">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-2">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                    {walletLoading ? "..." : walletBalance === null ? "0.00" : walletBalance.toLocaleString()}
                  </p>
                  <p className="text-lg font-bold text-blue-600">{walletCurrency}</p>
                </div>
              </div>

              {walletBalance === null ? (
                <button className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={() => setShowTopUp(true)}
                 className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  Quick Top Up
                </button>
              )}
            </div>
          </motion.div>

          {/* Recommended Station */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200/70 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => {
              if (recommendedStation) {
                const loc = recommendedStation.location;
                if (typeof loc === "object" && loc !== null && "lat" in loc) {
                  setSelected(recommendedStation);
                  mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 blur-[80px] rounded-full opacity-70 group-hover:opacity-100 transition" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Recommended Station</p>
              </div>
              {recommendedStation ? (
                <>
                  <p className="text-lg font-bold text-slate-900">{recommendedStation.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-600">
                      {typeof recommendedStation.location === "string"
                        ? recommendedStation.location
                        : recommendedStation.location?.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    {recommendedStation.petrol && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Petrol</span>
                    )}
                    {recommendedStation.diesel && (
                      <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Diesel</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">No stations available</p>
              )}
            </div>
          </motion.div>

          {/* Alerts & Insights */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200/70 shadow-md hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 blur-[80px] rounded-full opacity-70 group-hover:opacity-100 transition" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" />
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Fuel Alerts</p>
                </div>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 underline underline-offset-2"
                >
                  {notifications.filter((n) => !n.read).length} new
                </button>
              </div>
              <div className="flex gap-2">
                {(["petrol", "diesel"] as const).map((ft) => (
                  <button
                    key={ft}
                    onClick={async () => {
                      const enabled = fuelAlertEnabled[ft];
                      try {
                        if (enabled) {
                          const params = new URLSearchParams({ fuelType: ft });
                          await fetch(`/api/alerts/subscriptions?${params.toString()}`, { method: "DELETE" });
                        } else {
                          await fetch("/api/alerts/subscriptions", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ fuelType: ft }),
                          });
                        }
                        setFuelAlertEnabled((prev) => ({ ...prev, [ft]: !enabled }));
                        showToast(`Alerts for ${ft} ${enabled ? "disabled" : "enabled"}.`, "success");
                      } catch {
                        showToast("Failed to update alerts", "error");
                      }
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
  fuelAlertEnabled[ft]
    ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-md"
    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
}`}
                  >
                    {ft} {fuelAlertEnabled[ft] && "✓"}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Approved tickets: <span className="text-slate-900 font-semibold">{spendingStats.totalTickets}</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Last fuel: <span className="text-slate-900 font-semibold capitalize">{spendingStats.lastTicketFuel ?? "—"}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Map Section */}
        <section className="space-y-8 relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-200/30 blur-[120px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-200/30 blur-[120px] rounded-full" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3 text-slate-900">
              <MapPin className="w-6 h-6 text-blue-500" />
              Nearby Stations
             <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-1.5 text-xs font-bold rounded-full border border-blue-200 shadow-sm">
                {filteredStations.length}
              </span>
            </h2>
            <div className="relative w-full sm:w-80">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stations or locations..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-md focus:shadow-lg"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {loadingStations ? (
            <div className="relative bg-white/70 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-8 overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </div>
              <p className="text-xl font-bold text-blue-600 uppercase tracking-widest animate-pulse">Scanning Stations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-[2.5rem] border border-red-200">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-wide">Signal Interrupted</h3>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <>
              {/* Smart Insights Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
              >
                {[
                  { 
                    label: "Apex Recommendation", 
                    sub: "Peak efficiency node nearby",
                    icon: Award, 
                    color: "indigo",
                    station: filteredStations.sort((a, b) => (a.estimatedWaitMinutes || 0) - (b.estimatedWaitMinutes || 0)).find(s => s.petrol || s.diesel)
                  },
                  { 
                    label: "Velocity Node", 
                    sub: "Minimal queue detected",
                    icon: Zap, 
                    color: "emerald",
                    station: filteredStations.filter(s => s.petrol || s.diesel).sort((a, b) => (a.estimatedWaitMinutes || 0) - (b.estimatedWaitMinutes || 0))[0]
                  }
                ].map((insight, idx) => (
                 <div
                          key={idx}
                          className="relative bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-8 overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                        <div
                            className={`absolute -top-10 -right-10 w-40 h-40 bg-${insight.color}-300/30 blur-[80px] rounded-full opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500`}
                          />
             <div className="relative z-10 flex items-center gap-6">
                       <div
                      className={`w-16 h-16 rounded-3xl bg-gradient-to-br from-${insight.color}-100 to-${insight.color}-50 border border-${insight.color}-200 flex items-center justify-center shadow-inner`}
                    >
                      <insight.icon className={`w-8 h-8 text-${insight.color}-600`} />
                    </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{insight.label}</p>
                       <h3 className={`text-xl font-black text-slate-900 group-hover:text-${insight.color}-600 transition-colors tracking-tight`}>
                          {insight.station?.name || "Locating Optimized Hub..."}
                        </h3>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
                            {insight.sub}
                          </p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Map */}
              <div
                ref={mapSectionRef}
                className="h-64 md:h-96 rounded-[3rem] overflow-hidden border border-slate-200 shadow-lg transition-all hover:border-blue-300 mb-12 bg-white group relative"
              >
                <div className="absolute top-6 right-6 z-[10] flex gap-2">
                   <div className="px-5 py-2.5 bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl text-[10px] font-bold text-slate-700 uppercase tracking-widest shadow-lg flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      Map Active
                   </div>
                </div>
                <OSMMap
                  stations={filteredStations}
                  centerTo={selected && typeof selected.location === 'object' ? { lat: selected.location.lat, lng: selected.location.lng } : undefined}
                />
              </div>

              {/* Station Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <AnimatePresence>
                  {paginatedStations.map((station, idx) => (
                    <motion.div
                      key={station._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                      whileHover={{ scale: 1.02, translateY: -10 }}
                      onClick={() => {
                        const loc = station.location;
                        if (typeof loc === "object" && loc !== null && "lat" in (loc as { lat: number })) {
                          setSelected(station);
                          mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 hover:border-blue-300 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 blur-[60px] rounded-full group-hover:bg-blue-200/30 transition-all" />

                      <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-3xl text-slate-900 group-hover:text-blue-600 transition-colors truncate tracking-tight">
                              {station.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <p className="text-sm text-slate-600 font-medium truncate uppercase tracking-tight">
                                {typeof station.location === "string" ? station.location : station.location?.text}
                              </p>
                            </div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            station.petrol || station.diesel
                            ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                            : "bg-red-100 border-red-300 text-red-700"
                            }`}>
                            {station.petrol || station.diesel ? "ACTIVE" : "CLOSED"}
                          </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-200 group-hover:bg-blue-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-2xl bg-blue-100 border border-blue-200">
                                <Fuel className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Petrol</p>
                                <span className={`text-lg font-bold ${station.petrol ? "text-slate-900" : "text-red-500"}`}>
                                  {station.petrol ? `${station.petrolQty ?? 0}L` : "EMPTY"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-1">Price/L</p>
                                <p className="text-3xl font-bold text-blue-600 tracking-tight">{station.petrolPrice ?? 80}<span className="text-xs ml-1 text-slate-500">ETB</span></p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border border-slate-200 group-hover:bg-amber-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-2xl bg-amber-100 border border-amber-200">
                                <Gauge className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Diesel</p>
                                <span className={`text-lg font-bold ${station.diesel ? "text-slate-900" : "text-red-500"}`}>
                                  {station.diesel ? `${station.dieselQty ?? 0}L` : "EMPTY"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Price/L</p>
                                <p className="text-3xl font-bold text-amber-600 tracking-tight">{station.dieselPrice ?? 75}<span className="text-xs ml-1 text-slate-500">ETB</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className={`flex flex-col gap-2 p-5 rounded-[2rem] bg-slate-50 border border-slate-200 relative overflow-hidden group/item transition-all hover:bg-slate-100 ${
                             !station.estimatedWaitMinutes || station.estimatedWaitMinutes < 10 ? "border-emerald-300"
                             : station.estimatedWaitMinutes < 25 ? "border-amber-300"
                             : "border-red-300"
                           }`}>
                             <div className={`absolute top-0 left-0 w-1 h-full ${
                               !station.estimatedWaitMinutes || station.estimatedWaitMinutes < 10 ? "bg-emerald-500"
                               : station.estimatedWaitMinutes < 25 ? "bg-amber-500"
                               : "bg-red-500"
                             }`} />
                             <div className="flex items-center gap-2 text-slate-600">
                               <Clock className="w-3.5 h-3.5" />
                               <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Queue</span>
                             </div>
                             <div>
                               <p className="text-xl font-bold text-slate-900 leading-none">
                                 {station.estimatedWaitMinutes ? `~${station.estimatedWaitMinutes}m` : "No Queue"}
                               </p>
                               <span className={`text-[9px] font-semibold uppercase tracking-widest mt-1 block ${
                                 !station.estimatedWaitMinutes || station.estimatedWaitMinutes < 10 ? "text-emerald-600"
                                 : station.estimatedWaitMinutes < 25 ? "text-amber-600"
                                 : "text-red-600"
                               }`}>
                                 {(!station.estimatedWaitMinutes || station.estimatedWaitMinutes < 10) ? "Fast" : station.estimatedWaitMinutes < 25 ? "Moderate" : "Slow"}
                               </span>
                             </div>
                           </div>
                           <div className="flex flex-col gap-2 p-5 rounded-[2rem] bg-slate-50 border border-slate-200 relative overflow-hidden">
                             <div className="flex items-center gap-2 text-slate-600">
                               <Star className="w-3.5 h-3.5" />
                               <span className="text-[10px] font-semibold uppercase tracking-widest">Rating</span>
                             </div>
                             <div>
                               <p className="text-sm font-bold text-slate-900">{station.avgRating?.toFixed(1) ?? "New"}</p>
                               <div className="flex gap-0.5 mt-1">
                                 {[1, 2, 3, 4, 5].map(star => (
                                   <div key={star} className={`w-1.5 h-1.5 rounded-full ${star <= (station.avgRating ?? 0) ? "bg-yellow-500" : "bg-slate-200"}`} />
                                 ))}
                               </div>
                             </div>
                           </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            disabled={!station.petrol}
                            onClick={(e) => {
                              e.stopPropagation();
                              startCheckout(station, "petrol");
                            }}
                            className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${station.petrol
                              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              }`}
                          >
                            Fill Petrol
                          </button>
                          <button
                            disabled={!station.diesel}
                            onClick={(e) => {
                              e.stopPropagation();
                              startCheckout(station, "diesel");
                            }}
                            className={`flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${station.diesel
                              ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              }`}
                          >
                            Fill Diesel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-semibold transition-all ${page === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
                </motion.div>
            )}

            {view === "logs" && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900 uppercase tracking-tight">Fuel <span className="text-blue-600">Logs</span></h2>
                    <p className="text-slate-600 font-medium mt-1 uppercase tracking-widest text-xs">Complete Fuel Request History</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-5 py-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3">
                       <Activity className="w-5 h-5 text-blue-600" />
                       <span className="text-sm font-bold text-slate-900">{requests.length} Total Logs</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-slate-50 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                          <th className="px-8 py-6">Station</th>
                          <th className="px-8 py-6">Fuel Type</th>
                          <th className="px-8 py-6">Quantity</th>
                          <th className="px-8 py-6">Total</th>
                          <th className="px-8 py-6 text-center">Status</th>
                          <th className="px-8 py-6">Date</th>
                          <th className="px-8 py-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {requests.map((r, idx) => (
                          <motion.tr
                            key={r._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group hover:bg-slate-50 transition-all duration-300"
                          >
                            <td className="px-8 py-6">
                               <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{r.stationId?.name ?? "Unknown Station"}</span>
                                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">{r.stationId?.location ?? "—"}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${r.fuelType === "petrol"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                                }`}>
                                {r.fuelType}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-slate-700 font-semibold">{r.amount ? `${r.amount} L` : "—"}</td>
                            <td className="px-8 py-6 font-bold text-slate-900">{r.totalPrice ? `${r.totalPrice.toLocaleString()} ETB` : "—"}</td>
                            <td className="px-8 py-6">
                               <div className="flex justify-center">
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] ${r.status === "PENDING" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                                    r.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                      r.status === "CANCELED" ? "bg-slate-100 text-slate-600 border border-slate-200" :
                                        "bg-red-100 text-red-700 border border-red-200"
                                    }`}>
                                    {r.status}
                                  </span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-[10px] text-slate-500 font-medium uppercase tracking-widest">{formatDateTime(r.createdAt)}</td>
                            <td className="px-8 py-6 text-right">
                              {r.status === "PENDING" ? (
                                <button
                                  onClick={() => openCancelConfirm(r._id)}
                                  disabled={mutatingId === r._id}
                                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-widest hover:bg-red-200 transition-all border border-red-200"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <button
                                  onClick={() => openRemoveConfirm(r._id)}
                                  disabled={mutatingId === r._id}
                                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                        {requests.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-20 text-slate-500 font-medium uppercase tracking-[0.4em] text-xs">
                              No fuel requests found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {view === "vehicles" && (
              <motion.div
                key="vehicles"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-40 space-y-8 text-center"
              >
                <div className="w-32 h-32 rounded-[3rem] bg-slate-100 border border-slate-200 flex items-center justify-center shadow-lg relative group">
                  <div className="absolute inset-0 bg-blue-100 blur-[40px] rounded-full group-hover:scale-125 transition-transform" />
                  <Car className="w-16 h-16 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Vehicle Management</h2>
                  <p className="text-slate-600 font-medium mt-2 uppercase tracking-widest text-xs">Vehicle Integration Coming Soon</p>
                </div>
                <button className="px-8 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all cursor-not-allowed">
                   Coming Soon
                </button>
              </motion.div>
            )}

            {view === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                 <div className="p-10 rounded-[3rem] bg-white border border-slate-200 space-y-10 relative overflow-hidden group shadow-lg">
                   <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 blur-[80px] rounded-full" />
                   <div className="flex items-center gap-8 relative z-10">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                         U
                      </div>
                      <div>
                         <h3 className="text-3xl font-bold text-slate-900 uppercase">User Profile</h3>
                         <p className="text-slate-600 font-medium mt-1 uppercase tracking-widest text-xs">Account Settings</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pt-6">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                         <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Notifications</p>
                         <p className="text-sm font-medium text-slate-900 uppercase">High Priority Only</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                         <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Theme</p>
                         <p className="text-sm font-medium text-slate-900 uppercase">Clean Light</p>
                      </div>
                   </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutStation && checkoutFuelType && (() => {
          const pricePerLitre = checkoutFuelType === "petrol"
            ? (checkoutStation.petrolPrice ?? 80)
            : (checkoutStation.dieselPrice ?? 75);
          const maxAvailable = checkoutFuelType === "petrol"
            ? (checkoutStation.petrolQty ?? 0)
            : (checkoutStation.dieselQty ?? 0);
          const total = checkoutAmount * pricePerLitre;
          const fuelEmoji = checkoutFuelType === "petrol" ? "⛽" : "🛢";
          const locationText = typeof checkoutStation.location === "string"
            ? checkoutStation.location
            : checkoutStation.location?.text ?? "";

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessingPayment && setCheckoutStation(null)} />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[92vh] space-y-5"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Fuel Order</p>
                    <h3 className="text-2xl font-bold text-slate-900">{checkoutStation.name}</h3>
                    {locationText && (
                      <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {locationText}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setCheckoutStation(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Station Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                    <Star className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Rating</p>
                    <p className="font-semibold text-slate-900">
                      {checkoutStation.avgRating?.toFixed(1) ?? "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                    <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Queue</p>
                    <p className="font-semibold text-slate-900">{checkoutStation.queueLength ?? 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                    <Gauge className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-500">Est. Wait</p>
                    <p className="font-semibold text-slate-900">
                      {checkoutStation.estimatedWaitMinutes ? `~${checkoutStation.estimatedWaitMinutes}m` : "—"}
                    </p>
                  </div>
                </div>

                {/* Fuel Type Banner */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${checkoutFuelType === "petrol"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-amber-50 border-amber-200"
                  }`}>
                  <span className="text-2xl">{fuelEmoji}</span>
                  <div className="flex-1">
                    <p className="font-bold capitalize text-slate-900">{checkoutFuelType}</p>
                    <p className="text-xs text-slate-600">{maxAvailable} L available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Price/L</p>
                    <p className="font-bold text-slate-900">{pricePerLitre.toLocaleString()} ETB</p>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label htmlFor="checkout-amount" className="text-sm font-semibold text-slate-700 block mb-2">
                    Quantity (Litres)
                  </label>
                  <input
                    id="checkout-amount"
                    title="Quantity in Litres"
                    type="number"
                    min="1"
                    max={maxAvailable}
                    value={checkoutAmount}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value) || 0;
                      const clamped = Math.min(Math.max(1, raw), maxAvailable || 1);
                      setCheckoutAmount(clamped);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold text-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Max available: <span className="text-slate-900 font-semibold">{maxAvailable} L</span>
                  </p>
                </div>

                {/* Total */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Amount</span>
                    <span className="text-2xl font-bold text-slate-900">{total.toLocaleString()} ETB</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <Shield className="w-3 h-3" />
                  <span>Secure payment via Chapa · TeleBirr, CBEBirr & more</span>
                </div>

                <button
                  disabled={isProcessingPayment || checkoutAmount <= 0}
                  onClick={handlePayment}
                  className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl transition-all disabled:opacity-50 disabled:from-slate-400 disabled:to-slate-500 flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay {total.toLocaleString()} ETB with Chapa
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingStationId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submittingRating && setRatingStationId(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl"
            >
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-900">Rate This Station</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Share your experience to help other drivers
                </p>
              </div>

              <div className="flex justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRatingValue(n)}
                    className={`text-3xl transition-all ${n <= ratingValue ? "text-yellow-400 scale-110" : "text-slate-600"
                      }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  disabled={submittingRating}
                  onClick={() => setRatingStationId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={submittingRating}
                  onClick={async () => {
                    if (!ratingStationId) return;
                    setSubmittingRating(true);
                    try {
                      const res = await fetch(`/api/stations/${ratingStationId}/rate`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ score: ratingValue }),
                      });
                      const data = await res.json();
                      if (!res.ok || data.error) {
                        showToast(data.error || "Failed to submit rating", "error");
                      } else {
                        showToast("Rating submitted! Thank you.", "success");
                        setStations((prev) =>
                          prev.map((s) =>
                            s._id === ratingStationId
                              ? { ...s, avgRating: data.avgRating, ratingCount: data.ratingCount }
                              : s
                          )
                        );
                        setRatingStationId(null);
                      }
                    } catch {
                      showToast("Failed to submit rating", "error");
                    } finally {
                      setSubmittingRating(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition"
                >
                  {submittingRating ? "Submitting..." : "Submit"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Confirmation Modal */}
      <AnimatePresence>
        {ticketData && (() => {
          const fuelEmoji = ticketData.fuelType === "petrol" ? "⛽" : "🛢";
          const mapUrl = ticketData.stationLocation
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticketData.stationLocation)}`
            : null;
          const ticketRef = `FS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              >
                {/* Success Header */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-center space-y-2">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black text-white">Payment Confirmed!</h3>
                  <p className="text-blue-100/80 text-sm">Your fuel request is confirmed</p>
                  <div className="inline-block bg-black/20 rounded-xl px-4 py-2 mt-2">
                    <p className="text-[10px] text-blue-200/60 uppercase tracking-wider">Ticket Reference</p>
                    <p className="font-black text-white tracking-wider text-lg">{ticketRef}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Station Info */}
                  <div className="flex gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{ticketData.stationName}</p>
                      {ticketData.stationLocation && (
                        <p className="text-xs text-slate-600 mt-0.5">{ticketData.stationLocation}</p>
                      )}
                      {mapUrl && (
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700">
                          <Navigation className="w-3 h-3" />
                          Get Directions
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase text-slate-600 mb-3">Order Summary</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{fuelEmoji}</span>
                      <div>
                        <p className="font-bold capitalize text-slate-900">{ticketData.fuelType}</p>
                        <p className="text-xs text-slate-600">
                          {ticketData.litres} L × {ticketData.pricePerLitre.toLocaleString()} ETB
                        </p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-slate-600">Total</p>
                        <p className="font-black text-slate-900 text-lg">{ticketData.total.toLocaleString()} ETB</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setTicketData(null)}
                    className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all shadow-lg"
                  >
                    View My Tickets
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Other Modals */}
      <ConfirmModal
        open={confirmOpen}
        title="Cancel Fuel Request"
        message="Are you sure you want to cancel this pending request? This action cannot be undone."
        onConfirm={() => cancelRequest(cancelId as string)}
        onCancel={() => { setConfirmOpen(false); setCancelId(null); }}
      />

      <ConfirmModal
        open={removeConfirmOpen}
        title="Remove from History"
        message="This record will be permanently removed from your request history. Do you wish to continue?"
        onConfirm={() => removeRequest(removeId as string)}
        onCancel={() => { setRemoveConfirmOpen(false); setRemoveId(null); }}
      />

      {/* Add Station Modal */}
      <AnimatePresence>
        {showAddStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !stationRegisterLoading && setShowAddStation(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600/60 font-bold mb-1">Station Owner</p>
                  <h3 className="text-2xl font-bold text-slate-900">Register Station</h3>
                </div>
                <button
                  disabled={stationRegisterLoading}
                  onClick={() => setShowAddStation(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleRegisterStation} className="space-y-4">
                <div>
                  <label htmlFor="station-name" className="text-xs font-bold uppercase tracking-wide text-blue-600/60 block mb-2">
                    Station Name
                  </label>
                  <input
                    id="station-name"
                    title="Station Name"
                    type="text"
                    required
                    placeholder="e.g. Central Fuel Depot"
                    value={stationForm.name}
                    onChange={(e) => setStationForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label htmlFor="station-location" className="text-xs font-bold uppercase tracking-wide text-blue-600/60 block mb-2">
                    Station Location
                  </label>
                  <input
                    id="station-location"
                    title="Station Location"
                    type="text"
                    required
                    placeholder="Address or coordinates"
                    value={stationForm.location}
                    onChange={(e) => setStationForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={stationRegisterLoading}
                  className="w-full py-4 mt-2 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl transition disabled:opacity-50 text-white"
                >
                  {stationRegisterLoading ? "Registering..." : "Add Station"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !topUpLoading && setShowTopUp(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-600/60 font-bold mb-1">Wallet</p>
                  <h3 className="text-2xl font-bold text-slate-900">Top Up Balance</h3>
                </div>
                <button onClick={() => setShowTopUp(false)} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-700">✕</button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                <p className="text-xs text-slate-600">Current Balance</p>
                <p className="font-bold text-lg text-slate-900">{walletBalance?.toLocaleString() ?? 0} {walletCurrency}</p>
              </div>

              <div>
                <label htmlFor="top-up-amount" className="text-xs font-bold uppercase tracking-wide text-blue-600/60 block mb-2">
                  Amount (ETB)
                </label>
                <input
                  id="top-up-amount"
                  title="Top Up Amount"
                  type="number"
                  min={10}
                  value={topUpAmount}
                  onChange={e => setTopUpAmount(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="flex gap-2 mt-3">
                  {[100, 250, 500, 1000].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setTopUpAmount(preset)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${topUpAmount === preset
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                    >
                      {preset} ETB
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <Shield className="w-3 h-3" />
                <span>Secure payment via Chapa · TeleBirr, CBEBirr & more</span>
              </div>

              <button
                disabled={topUpLoading || topUpAmount <= 0}
                onClick={handleTopUp}
                className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl transition disabled:opacity-50 text-white"
              >
                {topUpLoading ? "Redirecting..." : `Add ${topUpAmount.toLocaleString()} ETB`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNotifications(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto space-y-4"
            >
              <div className="flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm py-2">
                <h3 className="text-xl font-bold text-slate-900">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700">✕</button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">No alerts yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Turn on alerts to get notified when fuel becomes available
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n._id}
                      className={`p-4 rounded-xl border transition-all ${n.read
                        ? "border-slate-200 bg-slate-50"
                        : "border-blue-400/30 bg-blue-50"
                        }`}
                    >
                      <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      {n.createdAt && (
                        <p className="text-[10px] text-slate-500 mt-2">{formatDateTime(n.createdAt)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await fetch("/api/alerts/notifications", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ markAllRead: true }),
                      });
                      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                      showToast("All notifications marked as read", "success");
                    } catch {
                      showToast("Failed to mark as read", "error");
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-200 text-xs font-semibold hover:bg-slate-300 text-slate-700 transition"
                >
                  Mark all as read
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}