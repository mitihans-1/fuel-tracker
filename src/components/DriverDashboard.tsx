import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Station } from "./OSMMap";
import { QRCodeCanvas } from "qrcode.react";
const OSMMap = dynamic(() => import("@/components/OSMMap"), { ssr: false });

import { formatDateTime } from "@/lib/utils";

interface FuelRequest {
  _id: string;
  stationId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

const PAGE_SIZE = 6;

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium ${
            t.type === "success"
              ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
              : t.type === "error"
              ? "bg-red-500/20 border-red-400/30 text-red-200"
              : "bg-sky-500/20 border-sky-400/30 text-sky-200"
          }`}
        >
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100 transition">✕</button>
        </div>
      ))}
    </div>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel}></div>
      <div className="relative bg-slate-900 rounded-xl border border-white/10 p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-blue-200 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded bg-gray-700" onClick={onCancel}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-600" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export interface FullStation extends Station {
  petrol: boolean;
  diesel: boolean;
  petrolQty?: number;
  dieselQty?: number;
  queueLength?: number;
  estimatedWaitMinutes?: number;
  avgRating?: number;
  ratingCount?: number;
}

interface Receipt {
  createdAt: Date;
  _id: string;
  stationName: string;
  fuelType: string;
  amount: number;
  totalPrice: number;
  paymentMethod: string;
  ticketId: string;
}

interface FuelAlertSubscription {
  _id: string;
  fuelType: "petrol" | "diesel";
  active: boolean;
}

export default function DriverDashboard() {
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
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbebirr" | "cash">("telebirr");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletCurrency, setWalletCurrency] = useState<string>("ETB");
  const [walletLoading, setWalletLoading] = useState(false);
  const [ratingStationId, setRatingStationId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [submittingRating, setSubmittingRating] = useState(false);
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
  const [mutatingId, setMutatingId] = useState<string | null>(null); // id being canceled
  const toastId = useRef(0);
  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
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
        // keep card but show as unavailable
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
          const petrol = subs.some(
            (s) => s.fuelType === "petrol" && s.active
          );
          const diesel = subs.some(
            (s) => s.fuelType === "diesel" && s.active
          );
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

  // Fetch stations (with queue / wait info)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const res = await fetch(`/api/stations/with-queue`);
        if (!res.ok) throw new Error("Failed to fetch stations");
        const data = await res.json();
        setStations(data);
      } catch {
        setError("Could not load stations");
      } finally {
        setLoadingStations(false);
      }
    };
    // small debounce
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
      setRequests(data);
    } catch {
      showToast("Failed to load your requests", "error");
    } finally {
      setLoadingRequests(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Real-time updates using EventSource for stations (keeps map updated)
  useEffect(() => {
    const es = new EventSource("/api/request/station/stream");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setStations(data);
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
    setReceipt(null);
  };

  const handlePayment = async () => {
    if (!checkoutStation || !checkoutFuelType) return;
    
    setIsProcessingPayment(true);
    try {
      const pricePerLitre = checkoutFuelType === "petrol" ? 80 : 75; // Example prices
      const totalPrice = checkoutAmount * pricePerLitre;

      const res = await fetch("/api/stations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          stationId: checkoutStation._id, 
          fuelType: checkoutFuelType,
          amount: checkoutAmount,
          totalPrice,
          paymentMethod
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReceipt({
          ...data,
          stationName: checkoutStation.name,
          fuelType: checkoutFuelType,
          amount: checkoutAmount,
          totalPrice,
          paymentMethod,
          ticketId: `FT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });
        showToast("Payment successful! Your ticket is ready.", "success");
        await loadRequests();
      } else {
        const data = await res.json();
        showToast(data.error || "Payment failed", "error");
      }
    } catch {
      showToast("Error processing payment", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Cancel request flow
  const openCancelConfirm = (id: string) => {
    setCancelId(id);
    setConfirmOpen(true);
  };

  const cancelRequest = async (id: string) => {
    if (!id) return;
    setConfirmOpen(false);
    setMutatingId(id);

    // optimistic update: mark locally as CANCELED
    const prev = requests;
    setRequests((r) => r.map((x) => (x._id === id ? { ...x, status: "CANCELED" } : x)));

    try {
      const res = await fetch(`/api/request/driver/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to cancel");
      }
      const data = await res.json();
      if (data && data.request) {
        // ensure server result
        setRequests((r) => r.map((x) => (x._id === id ? data.request : x)));
        showToast("Request canceled", "success");
      } else {
        // reload if unexpected
        await loadRequests();
        showToast("Request canceled", "success");
      }
    } catch {
      // rollback
      setRequests(prev);
      showToast("Failed to cancel request", "error");
    } finally {
      setMutatingId(null);
      setCancelId(null);
    }
  };

  const removeRequest = async (id: string) => {
    if (!id) return;
    if (!confirm("Are you sure you want to remove this from your history?")) return;
    
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

  // Filter stations by search query
  const filteredStations = stations.filter(
    (s) => {
      const nameMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const locationText = typeof s.location === 'string' ? s.location : s.location?.text || '';
      const locationMatch = locationText.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || locationMatch;
    }
  );

  // Stats
  const stats = {
    totalRequests: requests.length,
    pendingCount: requests.filter((r) => r.status === "PENDING").length,
    approvedCount: requests.filter((r) => r.status === "APPROVED").length,
  };

  const spendingStats = {
    totalTickets: requests.filter((r) => r.status === "APPROVED").length,
    lastTicketFuel:
      requests
        .filter((r) => r.status === "APPROVED")
        .slice(-1)[0]?.fuelType ?? null,
  };

  const recommendedStation =
    filteredStations.find(
      (s) => (s.petrol || s.diesel) && (s.petrolQty ?? 0) + (s.dieselQty ?? 0) > 0
    ) ?? filteredStations[0];

  const totalPages = Math.max(1, Math.ceil(filteredStations.length / PAGE_SIZE));
  const paginatedStations = filteredStations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="dashboard-root min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER + OVERVIEW */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Driver Dashboard
              </h1>
              <p className="text-blue-200/70 mt-2 text-lg">
                Request fuel, manage your tickets, and discover the best nearby stations.
              </p>
            </div>

            {/* STATS */}
            <div className="flex bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <div className="px-6 py-3 text-center border-r border-white/10">
                <p className="text-xs text-blue-200 uppercase">Total</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
              <div className="px-6 py-3 text-center border-r border-white/10">
                <p className="text-xs text-blue-200 uppercase">Pending</p>
                <p className="text-2xl font-bold text-orange-400">
                  {stats.pendingCount}
                </p>
              </div>
              <div className="px-6 py-3 text-center">
                <p className="text-xs text-blue-200 uppercase">Approved</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.approvedCount}
                </p>
              </div>
            </div>
          </div>

          {/* WALLET + RECOMMENDATION + INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 shadow-lg">
              <p className="text-xs uppercase tracking-wide text-blue-200/70 font-semibold">
                Driver Wallet (Preview)
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {walletLoading
                  ? "Loading..."
                  : walletBalance === null
                  ? "Unavailable"
                  : `${walletBalance.toLocaleString()} ${walletCurrency}`}
              </p>
              <p className="mt-1 text-xs text-blue-200/70">
                {walletBalance === null
                  ? "Wallet will activate once billing is configured."
                  : "Use this balance to pay for future fuel tickets."}
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/30 to-cyan-500/10 border border-emerald-400/40 rounded-2xl p-4 shadow-lg">
              <p className="text-xs uppercase tracking-wide text-emerald-200 font-semibold">
                Recommended Station
              </p>
              {recommendedStation ? (
                <>
                  <p className="mt-1 text-lg font-bold">
                    {recommendedStation.name}
                  </p>
                  <p className="text-xs text-emerald-100/80 mt-1">
                    📍{" "}
                    {typeof recommendedStation.location === "string"
                      ? recommendedStation.location
                      : recommendedStation.location?.text}
                  </p>
                  <p className="mt-2 text-xs text-emerald-100/80">
                    {recommendedStation.petrol && "Petrol available"}{" "}
                    {recommendedStation.diesel && recommendedStation.petrol
                      ? "• "
                      : ""}
                    {recommendedStation.diesel && "Diesel available"}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-emerald-100/80">
                  No station matches your current filters.
                </p>
              )}
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 shadow-lg space-y-3">
              <p className="text-xs uppercase tracking-wide text-blue-200/70 font-semibold">
                Driving Insights & Alerts
              </p>
              <p className="mt-2 text-sm">
                Approved tickets:{" "}
                <span className="font-semibold">
                  {spendingStats.totalTickets}
                </span>
              </p>
              <p className="mt-1 text-sm">
                Last approved fuel:{" "}
                <span className="font-semibold capitalize">
                  {spendingStats.lastTicketFuel ?? "—"}
                </span>
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-blue-200/70">
                  Fuel alerts
                </span>
                <div className="flex gap-1">
                  {(["petrol", "diesel"] as const).map((ft) => (
                    <button
                      key={ft}
                      onClick={async () => {
                        const enabled = fuelAlertEnabled[ft];
                        try {
                          if (enabled) {
                            const params = new URLSearchParams({
                              fuelType: ft,
                            });
                            await fetch(
                              `/api/alerts/subscriptions?${params.toString()}`,
                              { method: "DELETE" }
                            );
                          } else {
                            await fetch("/api/alerts/subscriptions", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ fuelType: ft }),
                            });
                          }
                          setFuelAlertEnabled((prev) => ({
                            ...prev,
                            [ft]: !enabled,
                          }));
                          showToast(
                            `Alerts for ${ft} ${
                              enabled ? "disabled" : "enabled"
                            }.`,
                            "success"
                          );
                        } catch {
                          showToast("Failed to update alerts", "error");
                        }
                      }}
                      className={`px-2 py-1 rounded-full text-[11px] capitalize ${
                        fuelAlertEnabled[ft]
                          ? "bg-green-500/30 text-green-200"
                          : "bg-white/10 text-blue-200/70"
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(true)}
                className="mt-1 text-[11px] text-cyan-300 underline underline-offset-4"
              >
                View notifications ({notifications.filter((n) => !n.read).length} new)
              </button>
            </div>
          </div>
        </header>

        {/* SEARCH & MAP */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              Available Stations
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 text-sm rounded-full">
                {filteredStations.length}
              </span>
            </h2>

            <input
              type="text"
              placeholder="Search stations or locations..."
              className="w-full sm:w-72 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-500 outline-none backdrop-blur-lg"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>

          {loadingStations ? (
            <div className="text-center py-12">Loading stations...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : (
            <>
              {/* Map */}
              <div ref={mapSectionRef} className="h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                <OSMMap stations={filteredStations} centerTo={selected && typeof selected.location === 'object' ? { lat: selected.location.lat, lng: selected.location.lng } : undefined} />
              </div>

              {/* STATION GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedStations.map((station) => (
                  <div
                    key={station._id}
                    onClick={() => {
                      const loc = station.location;
                      if (typeof loc === "object" && loc !== null && "lat" in loc) {
                        setSelected(station);
                        mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                    className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/20 hover:scale-[1.03] transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-white">
                          {station.name}
                        </h3>
                        <p className="text-blue-200 text-sm mt-1 flex items-center gap-2">
                          <span>
                            📍 {typeof station.location === "string" ? station.location : station.location?.text}
                          </span>
                          {((typeof station.location === "object" && station.location !== null && "lat" in station.location) || (typeof station.latitude === 'number' && typeof station.longitude === 'number')) && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${typeof station.latitude === 'number' ? station.latitude : (station.location as { lat: number }).lat},${typeof station.longitude === 'number' ? station.longitude : (station.location as { lng: number }).lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View on Map
                            </a>
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          station.petrol || station.diesel
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {station.petrol || station.diesel ? "OPEN" : "CLOSED"}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>⛽ Petrol</span>
                        <span className={station.petrol ? "text-green-400" : "text-red-400"}>
                          {station.petrol ? "Available" : "Out of Stock"}
                          <span className="ml-2 text-xs opacity-70">({station.petrolQty ?? 0} L)</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>🛢 Diesel</span>
                        <span className={station.diesel ? "text-green-400" : "text-red-400"}>
                          {station.diesel ? "Available" : "Out of Stock"}
                          <span className="ml-2 text-xs opacity-70">({station.dieselQty ?? 0} L)</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-yellow-200 mt-1">
                        <span>⭐ Rating</span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">
                            {typeof station.avgRating === "number"
                              ? station.avgRating.toFixed(1)
                              : "—"}
                          </span>
                          <span className="opacity-80">
                            ({station.ratingCount ?? 0})
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-blue-200/80 mt-1">
                        <span>🚗 Queue</span>
                        <span className="text-blue-100 font-semibold">
                          {typeof station.queueLength === "number" ? station.queueLength : 0}{" "}
                          vehicles
                          {typeof station.estimatedWaitMinutes === "number" && (
                            <span className="ml-2 opacity-80">
                              (~{station.estimatedWaitMinutes} min)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={!station.petrol}
                        onClick={() => startCheckout(station, "petrol")}
                        className={`flex-1 rounded-xl py-3 font-semibold transition ${
                          station.petrol
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Request Petrol
                      </button>
                      <button
                        disabled={!station.diesel}
                        onClick={() => startCheckout(station, "diesel")}
                        className={`flex-1 rounded-xl py-3 font-semibold transition ${
                          station.diesel
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Request Diesel
                      </button>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRatingStationId(station._id);
                          setRatingValue(5);
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30 transition"
                      >
                        Rate this station
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 bg-blue-500 rounded disabled:bg-gray-500"
                  >
                    Previous
                  </button>
                  <span className="px-2 py-2">{page} / {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-blue-500 rounded disabled:bg-gray-500"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* REQUEST HISTORY */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Request History</h2>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 overflow-x-auto shadow-xl">
            <table className="min-w-[600px] w-full">
              <thead className="bg-white/10 text-blue-200 text-sm">
                <tr>
                  <th className="px-6 py-4 text-left">Station</th>
                  <th className="px-6 py-4 text-left">Fuel</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="border-t border-white/10 hover:bg-white/10 transition">
                    <td className="px-6 py-4 font-semibold">{r.stationId?.name ?? "Unknown"}</td>
                    <td className="px-6 py-4 capitalize">{r.fuelType}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          r.status === "PENDING"
                            ? "bg-orange-500/20 text-orange-300"
                            : r.status === "APPROVED"
                            ? "bg-green-500/20 text-green-300"
                            : r.status === "CANCELED"
                            ? "bg-gray-500/20 text-gray-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-blue-200 text-sm">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {r.status === "PENDING" ? (
                          <button
                            onClick={() => openCancelConfirm(r._id)}
                            disabled={mutatingId === r._id}
                            className="px-3 py-2 rounded bg-red-600 text-sm disabled:opacity-50"
                          >
                            {mutatingId === r._id ? "Canceling..." : "Cancel"}
                          </button>
                        ) : (
                          <button
                            onClick={() => removeRequest(r._id)}
                            disabled={mutatingId === r._id}
                            className="px-3 py-2 rounded bg-gray-700 text-sm hover:bg-gray-600 transition disabled:opacity-50"
                          >
                            {mutatingId === r._id ? "Removing..." : "Remove"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-blue-200">
                      {loadingRequests ? "Loading requests..." : "No fuel requests yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* CHECKOUT MODAL */}
      {checkoutStation && checkoutFuelType && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isProcessingPayment && setCheckoutStation(null)}></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            {!receipt ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">Fuel Checkout</h3>
                    <p className="text-blue-200/60">{checkoutStation.name}</p>
                  </div>
                  <button onClick={() => setCheckoutStation(null)} className="p-2 hover:bg-white/10 rounded-full transition">✕</button>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-200/70 capitalize">{checkoutFuelType} Available</span>
                    <span className="font-bold text-green-400">
                      {checkoutFuelType === "petrol" ? checkoutStation.petrolQty : checkoutStation.dieselQty} Litres
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="fuelAmount" className="text-sm font-medium">Enter Amount (Litres)</label>
                    <input 
                      id="fuelAmount"
                      name="fuelAmount"
                      type="number" 
                      min="1" 
                      max={checkoutFuelType === "petrol" ? checkoutStation.petrolQty : checkoutStation.dieselQty}
                      value={checkoutAmount}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value) || 0;
                        const maxAvailable =
                          checkoutFuelType === "petrol"
                            ? checkoutStation.petrolQty ?? 0
                            : checkoutStation.dieselQty ?? 0;
                        const clamped = Math.min(Math.max(1, raw), maxAvailable || 1);
                        setCheckoutAmount(clamped);
                      }}
                      placeholder="e.g. 20"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <p className="text-xs text-blue-200/70">
                      You can order up to{" "}
                      <span className="font-semibold">
                        {checkoutFuelType === "petrol" ? checkoutStation.petrolQty : checkoutStation.dieselQty} L
                      </span>{" "}
                      at this station right now.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["telebirr", "cbebirr", "cash"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method as "telebirr" | "cbebirr" | "cash")}
                        className={`py-3 rounded-xl border capitalize text-sm font-bold transition ${
                          paymentMethod === method 
                            ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
                            : "bg-white/5 border-white/10 text-blue-200/60 hover:bg-white/10"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-blue-200">Total Price</span>
                    <span className="font-bold text-white">
                      {(checkoutAmount * (checkoutFuelType === "petrol" ? 80 : 75)).toLocaleString()} ETB
                    </span>
                  </div>
                  <button
                    disabled={isProcessingPayment || checkoutAmount <= 0}
                    onClick={handlePayment}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 py-4 rounded-2xl font-bold text-lg shadow-xl hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50"
                  >
                    {isProcessingPayment ? "Processing..." : `Pay with ${paymentMethod.toUpperCase()}`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✓</div>
                <h3 className="text-3xl font-bold">Payment Success!</h3>
                <p className="text-blue-200/60">Show this ticket at the station to get your fuel.</p>
                
                  <div className="bg-white text-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden text-left">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500"></div>
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs uppercase font-bold text-slate-400">Fuel Ticket</p>
                      <p className="text-xl font-black">{receipt.ticketId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold text-slate-400">Station</p>
                      <p className="font-bold">{receipt.stationName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Date</p>
                      <p className="font-bold">{formatDateTime(receipt.createdAt || new Date())}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Fuel Type</p>
                      <p className="font-bold capitalize">{receipt.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Amount</p>
                      <p className="font-bold">{receipt.amount} Litres</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Paid Via</p>
                      <p className="font-bold capitalize">{receipt.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
                      <p className="font-bold text-blue-600">{receipt.totalPrice} ETB</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-slate-200 flex justify-center">
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <QRCodeCanvas
                        value={receipt.ticketId}
                        size={128}
                        bgColor="#e5e7eb"
                        fgColor="#111827"
                        includeMargin
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStation(null)}
                  className="w-full bg-white/10 py-4 rounded-2xl font-bold hover:bg-white/20 transition"
                >
                  Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RATING SHEET */}
      {ratingStationId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => !submittingRating && setRatingStationId(null)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold">Rate this station</h3>
            <p className="text-xs text-blue-200/70">
              Only drivers who have actually received fuel at this station can submit a rating.
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingValue(n)}
                  className={`text-2xl ${
                    n <= ratingValue ? "text-yellow-300" : "text-slate-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={submittingRating}
                onClick={() => setRatingStationId(null)}
                className="px-4 py-2 rounded bg-gray-700 text-sm"
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
                      showToast("Rating submitted. Thank you!", "success");
                      setStations((prev) =>
                        prev.map((s) =>
                          s._id === ratingStationId
                            ? {
                                ...s,
                                avgRating: data.avgRating,
                                ratingCount: data.ratingCount,
                              }
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
                className="px-4 py-2 rounded bg-yellow-500 text-slate-900 font-semibold text-sm disabled:opacity-60"
              >
                {submittingRating ? "Submitting..." : "Submit rating"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS PANEL */}
      {showNotifications && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowNotifications(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Fuel Alerts</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-blue-200/70">
                No alerts yet. Turn on alerts for petrol or diesel to be notified when fuel becomes
                available.
              </p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className={`p-3 rounded-xl border text-sm ${
                      n.read
                        ? "border-white/10 bg-white/5 text-blue-100/80"
                        : "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
                    }`}
                  >
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-xs mt-1">{n.message}</p>
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
                    setNotifications((prev) =>
                      prev.map((n) => ({ ...n, read: true }))
                    );
                  } catch {
                    showToast("Failed to mark alerts as read", "error");
                  }
                }}
                className="w-full mt-2 py-2 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Cancel Fuel Request"
        message="Are you sure you want to cancel this pending request? This action cannot be undone."
        onConfirm={() => cancelRequest(cancelId as string)}
        onCancel={() => { setConfirmOpen(false); setCancelId(null); }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}