import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Station } from "./OSMMap";
const OSMMap = dynamic(() => import("@/components/OSMMap"), { ssr: false });

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

function timeAgo(dateStr?: string) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

export interface FullStation extends Station {
  petrol: boolean;
  diesel: boolean;
  petrolQty?: number;
  dieselQty?: number;
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

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const res = await fetch(`/api/stations?page=${page}&limit=${PAGE_SIZE}&q=${encodeURIComponent(searchQuery)}`);
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

  const requestFuel = async (stationId: string, fuelType: string) => {
    try {
      // confirmation to avoid accidental multiple clicks
      if (!confirm(`Request ${fuelType} from station?`)) return;

      const res = await fetch("/api/stations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId, fuelType }),
      });
      if (res.ok) {
        showToast(`${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)} request sent!`, "success");
        await loadRequests();
      } else {
        showToast("Failed to send request", "error");
      }
    } catch {
      showToast("Error requesting fuel", "error");
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

  const totalPages = Math.max(1, Math.ceil(filteredStations.length / PAGE_SIZE));
  const paginatedStations = filteredStations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="dashboard-root min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Driver Dashboard
            </h1>
            <p className="text-blue-200/70 mt-2 text-lg">
              Request fuel and find available stations easily.
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
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={!station.petrol}
                        onClick={() => requestFuel(station._id, "petrol")}
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
                        onClick={() => requestFuel(station._id, "diesel")}
                        className={`flex-1 rounded-xl py-3 font-semibold transition ${
                          station.diesel
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Request Diesel
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
                      {timeAgo(r.createdAt)}
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
                          <button className="px-3 py-2 rounded bg-gray-700 text-sm" disabled>
                            -
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