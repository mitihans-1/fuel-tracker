"use client"
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Chart as ChartJS , CategoryScale, LinearScale, BarElement,ArcElement, Tooltip, Legend, Title,} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Fuel, DollarSign,
  Clock, CheckCircle, XCircle, BarChart3,
  Download, ChevronDown, Calendar, Menu, X, LogOut,
  MapPin, Building2, Users, Activity, ScanLine, CheckCircle2,
  LayoutDashboard
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import SectionHeader from "@/components/ui/SectionHeader";
import ActionBar from "@/components/ui/ActionBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

type Toast = { id: number; message: string; type: "success" | "error" | "info" };
interface FuelRequest {
  _id: string;
  driverId: { name: string };
  fuelType: string;
  status: string;
  createdAt?: string;
}

interface StationData {
  _id: string;
  name: string;
  location: string;
  petrol: boolean;
  petrolQty?: number;
  petrolPrice?: number;
  diesel: boolean;
  dieselQty?: number;
  dieselPrice?: number;
}

// QR Scanner component using html5-qrcode
function QRScannerPanel({
  onScan,
  scannerMounted,
  setScannerMounted,
}: {
  onScan: (token: string) => void;
  scannerMounted: boolean;
  setScannerMounted: (v: boolean) => void;
}) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const domId = "qr-reader-station";

  useEffect(() => {
    if (scannerMounted) return;
    setScannerMounted(true);
    const scanner = new Html5QrcodeScanner(domId, { fps: 10, qrbox: 250 }, false);
    scannerRef.current = scanner;
    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {});
        onScan(decodedText);
        setScannerMounted(false);
      },
      () => {}
    );
    return () => {
      scanner.clear().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 overflow-hidden">
        <div id={domId} />
      </div>
      <p className="text-xs text-center text-slate-500 font-medium">
        Point the camera at the driver&apos;s QR code to verify their fuel ticket
      </p>
    </div>
  );
}

export default function StationDashboard() {
  const { user, clear } = useUser();
  const router = useRouter();
  const [myStations, setMyStations] = useState<StationData[]>([]);
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddStation, setShowAddStation] = useState(false);
  const [stationForm, setStationForm] = useState({ name: '', location: '' });
  const [stationRegisterLoading, setStationRegisterLoading] = useState(false);

  const [petrol, setPetrol] = useState(true);
  const [petrolQty, setPetrolQty] = useState(0);
  const [petrolPrice, setPetrolPrice] = useState(80);
  const [diesel, setDiesel] = useState(true);
  const [dieselQty, setDieselQty] = useState(0);
  const [dieselPrice, setDieselPrice] = useState(75);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "history" | "analytics" | "scanner" | "settings" | "products">("overview");
  const [loadingStations, setLoadingStations] = useState(true);

  const pageHeadings = {
    overview: {
      title: "Dashboard Overview",
      subtitle: "Performance metrics and platform status at a glance.",
    },
    pending: {
      title: "Operations Queue",
      subtitle: "Review and process incoming fuel requests in real time.",
    },
    products: {
      title: "Fuel Inventory",
      subtitle: "Manage inventory, pricing, and availability across your station.",
    },
    analytics: {
      title: "Business Insights",
      subtitle: "Track performance, demand, and revenue with clear analytics.",
    },
    history: {
      title: "Transaction Log",
      subtitle: "Audit past requests, approvals, and fulfillment history.",
    },
    scanner: {
      title: "QR Verification",
      subtitle: "Scan tickets and verify driver requests instantly.",
    },
    settings: {
      title: "Station Profile",
      subtitle: "Update station details, operating hours, and verification settings.",
    },
  } as const;

  const activePage = pageHeadings[activeTab];
  const managerName = user?.name?.split(" ")[0] || "Manager";
  // const petrolLevelWidthClass = petrolQty >= 10000 ? "w-full" : petrolQty >= 7500 ? "w-5/6" : petrolQty >= 5000 ? "w-3/4" : petrolQty >= 2500 ? "w-1/2" : petrolQty >= 1000 ? "w-1/4" : "w-12";
  // const dieselLevelWidthClass = dieselQty >= 10000 ? "w-full" : dieselQty >= 7500 ? "w-5/6" : dieselQty >= 5000 ? "w-3/4" : dieselQty >= 2500 ? "w-1/2" : dieselQty >= 1000 ? "w-1/4" : "w-12";
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; driverName?: string; fuelType?: string; amount?: number } | null>(null);
  const [scannerMounted, setScannerMounted] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<"today" | "7d" | "30d">("7d");
  const [analytics, setAnalytics] = useState<{
    totals: {
      totalLitres: number;
      totalRevenue: number;
      totalStationEarnings: number;
      totalPlatformCommission: number;
      pendingPayoutBalance: number;
      paidOutTotal: number;
      count: number;
    };
    byDay: { _id: { y: number; m: number; d: number }; litres: number; revenue: number }[];
    byFuel: { _id: string; litres: number; revenue: number }[];
    byHour: { _id: number; count: number }[];
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [priceHistory, setPriceHistory] = useState<{ _id: string; fuelType: string; price: number; createdAt: string }[]>([]);
  const [loadingPriceHistory, setLoadingPriceHistory] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [stockModal, setStockModal] = useState<{
    open: boolean;
    fuelType: "petrol" | "diesel";
    amount: number;
  }>({ open: false, fuelType: "petrol", amount: 1000 });
  const [stockSaving, setStockSaving] = useState(false);
  const searchParams = useSearchParams();
  const toastIdRef = useRef(0);

  // Tactical parameter observation
  useEffect(() => {
    const action = searchParams.get("action");
    const tab = searchParams.get("tab");

    if (action === "register") {
      setShowAddStation(true);
    }
    
    if (tab === "products") {
      setActiveTab("products");
    } else if (tab === "overview") {
      setActiveTab("overview");
    } else if (tab === "overview") {
      setActiveTab("overview");
    }

    if (action || tab) {
      // Clear parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const showToast = useCallback((msg: string | { error?: string; message?: string } | unknown, type: Toast["type"] = "info") => {
    const id = ++toastIdRef.current;
    let message = "";
    
    if (typeof msg === 'string') {
      message = msg;
    } else if (msg && typeof msg === 'object') {
      message = (msg as { error?: string }).error || (msg as { message?: string }).message || JSON.stringify(msg);
    } else {
      message = String(msg);
    }
    
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

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

  const refreshData = useCallback(async () => {
    try {
      setLoadingStations(true);
      const statusRes = await fetch("/api/stations/me");
      if (statusRes.ok) {
        const data = await statusRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setMyStations(data);
          const currentStation = activeStationId
            ? data.find(s => s._id === activeStationId)
            : data[0];
          if (currentStation) {
            if (!activeStationId) setActiveStationId(currentStation._id);
            setPetrol(!!currentStation.petrol);
            setPetrolQty(currentStation.petrolQty ?? 0);
            setPetrolPrice(currentStation.petrolPrice ?? 80);
            setDiesel(!!currentStation.diesel);
            setDieselQty(currentStation.dieselQty ?? 0);
            setDieselPrice(currentStation.dieselPrice ?? 75);
          }
        } else {
          setMyStations([]);
        }
      } else {
        setMyStations([]);
      }
      
      let reqUrl = "/api/request/station";
      if (activeStationId) reqUrl += `?stationId=${activeStationId}`;
      const reqRes = await fetch(reqUrl);
      const reqData = await reqRes.json();
      if (Array.isArray(reqData)) {
        setRequests(reqData);
      } else {
        setRequests([]);
      }
    } catch {
      // silent
    } finally {
      setLoadingStations(false);
    }
  }, [activeStationId]);

  const loadAnalytics = useCallback(async (range: "today" | "7d" | "30d" = "7d") => {
    try {
      setLoadingAnalytics(true);
      let url = `/api/stations/me/analytics?range=${range}`;
      if (activeStationId) url += `&stationId=${activeStationId}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [activeStationId]);

  const loadPriceHistory = useCallback(async () => {
    try {
      setLoadingPriceHistory(true);
      let url = "/api/stations/me/price-history";
      if (activeStationId) url += `?stationId=${activeStationId}`;
      const res = await fetch(url);
      if (res.ok) setPriceHistory(await res.json());
    } finally {
      setLoadingPriceHistory(false);
    }
  }, [activeStationId]);

  const exportCSV = () => {
    if (!analytics) return;
    const rows = [
      ["Date", "Litres", "Revenue (ETB)"],
      ...analytics.byDay.map(d => [
        `${d._id.d}/${d._id.m}/${d._id.y}`,
        String(d.litres),
        String(d.revenue),
      ]),
      [],
      ["Fuel Type", "Litres", "Revenue (ETB)"],
      ...analytics.byFuel.map(f => [f._id, String(f.litres), String(f.revenue)]),
      [],
      ["Summary", "", ""],
      ["Total Litres", String(analytics.totals.totalLitres), ""],
      ["Total Revenue", String(analytics.totals.totalRevenue), "ETB"],
      ["Total Requests", String(analytics.totals.count), ""],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `station-analytics-${analyticsRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported!", "success");
  };

  useEffect(() => {
    loadAnalytics(analyticsRange);
  }, [loadAnalytics, analyticsRange, activeStationId]);

  useEffect(() => {
    if (activeTab === "analytics") loadPriceHistory();
  }, [activeTab, loadPriceHistory]);

  useEffect(() => {
    const init = async () => {
      await refreshData();
    };
    init();
    const interval = setInterval(async () => {
      try {
        let reqUrl = "/api/request/station";
        if (activeStationId) reqUrl += `?stationId=${activeStationId}`;
        const reqRes = await fetch(reqUrl);
        const reqData = await reqRes.json();
        if (Array.isArray(reqData)) {
          setRequests(reqData);
        } else {
          setRequests([]);
        }
      } catch {
        // silent
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData, activeStationId]);

  const updateRequest = async (id: string, status: string) => {
    try {
      await fetch("/api/request/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, status }),
      });
      setRequests(prev =>
        prev.map(r => (r._id === id ? { ...r, status } : r))
      );
    } catch {
      // no-op
    }
  };

  const bulkUpdateRequests = async (status: "APPROVED" | "REJECTED") => {
    if (selectedPendingIds.length === 0) return;
    try {
      setBulkLoading(true);
      const res = await fetch("/api/request/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestIds: selectedPendingIds, status }),
      });
      if (!res.ok) {
        showToast("Bulk update failed", "error");
        return;
      }
      setRequests((prev) =>
        prev.map((r) =>
          selectedPendingIds.includes(r._id) ? { ...r, status } : r
        )
      );
      setSelectedPendingIds([]);
      showToast(`Updated ${selectedPendingIds.length} requests to ${status}`, "success");
    } catch {
      showToast("Bulk update failed", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  const togglePendingSelect = (id: string) => {
    setSelectedPendingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openStockModal = (fuelType: "petrol" | "diesel") => {
    setStockModal({ open: true, fuelType, amount: 1000 });
  };

  const submitStockAdd = async () => {
    if (!activeStationId || stockModal.amount <= 0) return;
    try {
      setStockSaving(true);
      if (stockModal.fuelType === "petrol") {
        const newQty = petrolQty + stockModal.amount;
        setPetrolQty(newQty);
        await fetch("/api/stations/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stationId: activeStationId, petrolQty: newQty }),
        });
      } else {
        const newQty = dieselQty + stockModal.amount;
        setDieselQty(newQty);
        await fetch("/api/stations/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stationId: activeStationId, dieselQty: newQty }),
        });
      }
      showToast(`Added ${stockModal.amount}L of ${stockModal.fuelType}`, "success");
      setStockModal((prev) => ({ ...prev, open: false }));
    } catch {
      showToast("Failed to add stock", "error");
    } finally {
      setStockSaving(false);
    }
  };

  const removeRequest = async (id: string) => {
    if (!id) return;
    if (!confirm("Delete this request record permanently?")) return;
    try {
      const res = await fetch("/api/request/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
      if (res.ok) {
        setRequests(prev => prev.filter(r => r._id !== id));
        showToast("Record deleted successfully.", "success");
      } else {
        showToast("Failed to delete record.", "error");
      }
    } catch {
      showToast("An error occurred while deleting the record.", "error");
    }
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  const pendingRequests = safeRequests.filter(r => r.status === "PENDING");
  const historyRequests = safeRequests.filter(r => r.status !== "PENDING");

  useEffect(() => {
    setSelectedPendingIds((prev) => {
      const next = prev.filter((id) => pendingRequests.some((r) => r._id === id));
      if (next.length === prev.length && next.every((id, idx) => id === prev[idx])) {
        return prev;
      }
      return next;
    });
  }, [pendingRequests]);

  const stats = {
    pending: pendingRequests.length,
    approvedToday: requests.filter(r => r.status === "APPROVED").length,
    rejectedToday: requests.filter(r => r.status === "REJECTED").length,
  };

  const throughput = {
    todayApproved: stats.approvedToday,
    todayRejected: stats.rejectedToday,
    queueSize: stats.pending,
  };
 const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clear();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const sidebarTabs: { id: "overview" | "pending" | "analytics" | "history" | "scanner" | "settings" | "products"; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, color: "text-indigo-500" },
    { id: "pending", label: "Operations Queue", icon: <Clock className="w-5 h-5" />, color: "text-indigo-500" },
    { id: "products", label: "Manage Products", icon: <Fuel className="w-5 h-5" />, color: "text-amber-500" },
    { id: "analytics", label: "Business Insights", icon: <BarChart3 className="w-5 h-5" />, color: "text-emerald-500" },
    { id: "history", label: "Transaction Logs", icon: <CheckCircle className="w-5 h-5" />, color: "text-purple-500" },
    { id: "scanner", label: "QR Verify", icon: <ScanLine className="w-5 h-5" />, color: "text-blue-500" },
    { id: "settings", label: "Station Profile", icon: <Building2 className="w-5 h-5" />, color: "text-slate-500" },
  ];

  const navGroups = [
    { label: "Main", ids: ["overview"] },
    { label: "Operations", ids: ["pending", "scanner"] },
    { label: "Inventory",  ids: ["products"] },
    { label: "Reporting",  ids: ["analytics", "history"] },
    { label: "Station",    ids: ["settings"] },
  ];

  const getTabBadge = (id: string): { value: string | number; color: string } | null => {
    switch (id) {
      case "overview":
        return null;
      case "pending":
        return pendingRequests.length > 0
          ? { value: pendingRequests.length, color: "bg-red-100 text-red-700" }
          : { value: "Clear", color: "bg-emerald-100 text-emerald-700" };
      case "products": {
        const activeCount = (petrol ? 1 : 0) + (diesel ? 1 : 0);
        return { value: `${activeCount}/2 live`, color: "bg-amber-100 text-amber-700" };
      }
      case "analytics":
        return analytics
          ? { value: `${analytics.totals.count} tx`, color: "bg-emerald-100 text-emerald-700" }
          : { value: analyticsRange, color: "bg-slate-100 text-slate-500" };
      case "history":
        return historyRequests.length > 0
          ? { value: historyRequests.length, color: "bg-purple-100 text-purple-700" }
          : { value: "Empty", color: "bg-slate-100 text-slate-500" };
      case "scanner":
        return { value: "Ready", color: "bg-blue-100 text-blue-700" };
      case "settings":
        return { value: "Online", color: "bg-emerald-100 text-emerald-700" };
      default:
        return null;
    }
  };

  if (!loadingStations && myStations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-red-500/10">
          ⚠️
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 max-w-md mb-8 font-medium">
          You are not currently assigned to any fuel station. If you are a station manager, please contact the system administrator to register your station and account.
        </p>
        <button 
          onClick={() => window.location.href = "/"}
          className="px-8 py-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (loadingStations) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Loading Operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root dashboard-shell min-h-screen">
      {/* Mobile Menu Button - to match AdminDashboard behavior */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          title="mobile"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 pro-surface border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 pt-24 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">FuelStation</h1>
            <button
              title="mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {sidebarTabs.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className={`${activeTab === item.id ? "text-white" : item.color}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64 min-h-screen pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="dashboard-content space-y-8">
          <SectionHeader
            title={activePage.title}
            subtitle={`${managerName}, ${activePage.subtitle}`}
          />

        <div className="lg:hidden pro-card p-2 flex overflow-x-auto no-scrollbar gap-2 mb-4">
          {sidebarTabs.map((t) => {
            const badge = getTabBadge(t.id);
            const isActive = activeTab === t.id;
            return (
              <button
                title="activetab"
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <div className={`shrink-0 ${isActive ? "text-white" : t.color}`}>{t.icon}</div>
                {t.label}
                {badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                    isActive ? "bg-white/25 text-white" : badge.color
                  }`}>
                    {badge.value}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Station Selector Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pro-surface rounded-[1.25rem] p-6"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              {myStations.length > 0 ? (
                <div>
                  <div className="relative group">
                    <label htmlFor=""></label>
                    <select
                      title="Select Active Station"
                      className="bg-transparent text-2xl font-black outline-none cursor-pointer appearance-none pr-10 text-slate-900 hover:text-indigo-600 transition-colors"
                      value={activeStationId || ""}
                      onChange={(e) => {
                        setActiveStationId(e.target.value);
                        setTimeout(() => refreshData(), 50);
                      }}
                    >
                      {myStations.map((station) => (
                        <option key={station._id} value={station._id} className="bg-white text-slate-900 text-base font-normal">
                          {station.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform pointer-events-none" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-sm text-slate-500 font-bold tracking-tight">
                      {myStations.find(s => s._id === activeStationId)?.location || "Global View"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">No stations registered.</p>
              )}
            </div>
            
            <div className="flex gap-4">
               <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">System Online</span>
               </div>
               <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Conditional Content rendering */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    icon: Clock,
                    label: "Queue Size",
                    value: throughput.queueSize,
                    color: "from-indigo-500 to-purple-600",
                    bgColor: "bg-indigo-50",
                    iconColor: "text-indigo-600",
                    trend: "+12%",
                    trendUp: true
                  },
                  {
                    icon: CheckCircle,
                    label: "Fulfilled Today",
                    value: throughput.todayApproved,
                    color: "from-emerald-500 to-teal-600",
                    bgColor: "bg-emerald-50",
                    iconColor: "text-emerald-600",
                    trend: "+8%",
                    trendUp: true
                  },
                  {
                    icon: XCircle,
                    label: "Declined Today",
                    value: throughput.todayRejected,
                    color: "from-red-500 to-rose-600",
                    bgColor: "bg-red-50",
                    iconColor: "text-red-600",
                    trend: "-3%",
                    trendUp: false
                  }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative pro-card p-6 transition-all"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.02] rounded-2xl transition-opacity`} />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trendUp ? (
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span className={`text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {stat.trend}
                          </span>
                          <span className="text-xs text-slate-400">vs yesterday</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative pro-card p-6 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Station Balance</p>
                      <p className="text-4xl font-black text-slate-900">
                        {(analytics?.totals?.totalStationEarnings ?? 0).toLocaleString()} ETB
                      </p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Net earnings after platform commission ({analyticsRange})
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative pro-card p-6 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Commission</p>
                      <p className="text-4xl font-black text-slate-900">
                        {(analytics?.totals?.totalPlatformCommission ?? 0).toLocaleString()} ETB
                      </p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Commission collected from your processed payments ({analyticsRange})
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative pro-card p-6 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pending Payout</p>
                      <p className="text-4xl font-black text-slate-900">
                        {(analytics?.totals?.pendingPayoutBalance ?? 0).toLocaleString()} ETB
                      </p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Eligible amount not yet settled by platform
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative pro-card p-6 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paid Out</p>
                      <p className="text-4xl font-black text-slate-900">
                        {(analytics?.totals?.paidOutTotal ?? 0).toLocaleString()} ETB
                      </p>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        Total settled to your station so far
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "products" ? (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* FUEL INVENTORY CONTROLS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Petrol Card */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`relative overflow-hidden rounded-[2.5rem] p-8 border transition-all duration-500 ${
                        petrol ? "bg-white border-indigo-200 shadow-xl" : "bg-slate-100 border-slate-200 opacity-80"
                      }`}
                    >
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full" />
                      
                      <div className="relative space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider">Benzene (Petrol)</h3>
                            <p className="text-sm text-indigo-500/60 font-bold">Main supply line</p>
                          </div>
                          <button 
                            title="status"
                            onClick={async () => {
                              const newStatus = !petrol;
                              setPetrol(newStatus);
                              await fetch("/api/stations/update", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ stationId: activeStationId, petrol: newStatus })
                              });
                              showToast(`Petrol ${newStatus ? "Available" : "Empty"}`, newStatus ? "success" : "info");
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              petrol ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-slate-200 text-slate-500 border border-slate-300"
                            }`}
                          >
                            {petrol ? "Available ✓" : "Out of Stock ✕"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                            <p className="text-[10px] font-bold text-indigo-600/50 uppercase tracking-widest mb-1">Current Price</p>
                            <div className="flex items-center gap-2">
                              <label htmlFor=""></label>
                              <input 
                                title="Petrol Price"
                                type="number"
                                value={petrolPrice}
                                onChange={(e) => setPetrolPrice(Number(e.target.value))}
                                onBlur={async () => {
                                  await fetch("/api/stations/update", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ stationId: activeStationId, petrolPrice })
                                  });
                                  showToast("Petrol price updated", "success");
                                }}
                                className="bg-transparent text-2xl font-black text-slate-900 w-20 outline-none"
                              />
                              <span className="text-sm font-bold text-indigo-600">ETB/L</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                            <p className="text-[10px] font-bold text-indigo-600/50 uppercase tracking-widest mb-1">Stock Level</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-black text-slate-900">{petrolQty.toLocaleString()}</p>
                              <span className="text-sm font-bold text-indigo-600">Litres</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            title="addstock"
                            onClick={() => openStockModal("petrol")}
                            className="flex-1 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                          >
                            + Add Stock
                          </button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Diesel Card */}
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`relative overflow-hidden rounded-[2.5rem] p-8 border transition-all duration-500 ${
                        diesel ? "bg-white border-amber-200 shadow-xl" : "bg-slate-100 border-slate-200 opacity-80"
                      }`}
                    >
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full" />
                      
                      <div className="relative space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wider">Nafta (Diesel)</h3>
                            <p className="text-sm text-amber-600/60 font-bold">Commercial fuel</p>
                          </div>
                          <button 
                            title="stationadd"
                            onClick={async () => {
                              const newStatus = !diesel;
                              setDiesel(newStatus);
                              await fetch("/api/stations/update", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ stationId: activeStationId, diesel: newStatus })
                              });
                              showToast(`Diesel ${newStatus ? "Available" : "Empty"}`, newStatus ? "success" : "info");
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                              diesel ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30" : "bg-slate-200 text-slate-500 border border-slate-300"
                            }`}
                          >
                            {diesel ? "Available ✓" : "Out of Stock ✕"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                            <p className="text-[10px] font-bold text-amber-600/50 uppercase tracking-widest mb-1">Current Price</p>
                            <div className="flex items-center gap-2">
                              <label htmlFor=""></label>
                              <input 
                                title="Diesel Price"
                                type="number"
                                value={dieselPrice}
                                onChange={(e) => setDieselPrice(Number(e.target.value))}
                                onBlur={async () => {
                                  await fetch("/api/stations/update", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ stationId: activeStationId, dieselPrice })
                                  });
                                  showToast("Diesel price updated", "success");
                                }}
                                className="bg-transparent text-2xl font-black text-slate-900 w-20 outline-none"
                              />
                              <span className="text-sm font-bold text-amber-600">ETB/L</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                            <p className="text-[10px] font-bold text-amber-600/50 uppercase tracking-widest mb-1">Stock Level</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-black text-slate-900">{dieselQty.toLocaleString()}</p>
                              <span className="text-sm font-bold text-amber-600">Litres</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button 
                            title="addstack"
                            onClick={() => openStockModal("diesel")}
                            className="flex-1 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                          >
                            + Add Stock
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : activeTab === "settings" ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">🏗️</div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Station Profile</h3>
                      <p className="text-sm text-slate-500 font-medium">Update your station public information and operational settings.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Station Name</label>
                          <input 
                          title="stationname"
                            type="text" 
                            defaultValue={myStations.find(s => s._id === activeStationId)?.name}
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Location Address</label>
                          <input 
                          title="stationlocation"
                            type="text" 
                            defaultValue={myStations.find(s => s._id === activeStationId)?.location}
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                         <h4 className="font-black uppercase tracking-widest text-xs mb-4 opacity-80">Operational Hours</h4>
                         <div className="flex items-center justify-between mb-4">
                            <span className="font-bold">24/7 Operations</span>
                            <div className="w-12 h-6 bg-white/20 rounded-full relative p-1 cursor-pointer">
                               <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                            </div>
                         </div>
                         <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                            Enabling 24/7 operations allows drivers to see your station on the map at any time. If disabled, you can set custom opening and closing times.
                         </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                         <button className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Discard Changes</button>
                         <button className="px-8 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Save Profile</button>
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div className="pro-card p-6 border-slate-200">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">Verification Status</h4>
                          <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">✓</div>
                                <div>
                                   <p className="text-xs font-bold text-slate-900">Email Verified</p>
                                   <p className="text-[10px] text-slate-500">Confirmed on account creation</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold">!</div>
                                <div>
                                   <p className="text-xs font-bold text-slate-900">Business License</p>
                                   <p className="text-[10px] text-slate-500">Pending manual review</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
                          <h4 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">Danger Zone</h4>
                          <p className="text-[10px] text-red-500/70 font-medium mb-4 leading-relaxed">
                             Permanently remove this station from the platform. This action cannot be undone.
                          </p>
                          <button className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                             Deactivate Station
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "scanner" ? (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                      <ScanLine className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">QR Ticket Verification</h3>
                      <p className="text-xs text-slate-500 font-medium">Scan a driver&apos;s QR code to mark their fuel request as completed</p>
                    </div>
                  </div>

                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-2xl border flex items-start gap-4 ${
                        scanResult.success
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      {scanResult.success ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-bold text-sm ${scanResult.success ? "text-emerald-900" : "text-red-900"}`}>
                          {scanResult.success ? "Ticket Verified ✓" : "Verification Failed"}
                        </p>
                        <p className={`text-xs mt-0.5 ${scanResult.success ? "text-emerald-700" : "text-red-700"}`}>
                          {scanResult.message}
                        </p>
                        {scanResult.success && (
                          <div className="mt-2 flex gap-3 text-xs text-emerald-700 font-medium">
                            {scanResult.driverName && <span>Driver: <strong>{scanResult.driverName}</strong></span>}
                            {scanResult.fuelType && <span>Fuel: <strong className="capitalize">{scanResult.fuelType}</strong></span>}
                            {scanResult.amount && <span>Qty: <strong>{scanResult.amount}L</strong></span>}
                          </div>
                        )}
                        <button
                          onClick={() => setScanResult(null)}
                          className="mt-3 text-xs underline underline-offset-2 opacity-60 hover:opacity-100"
                        >
                          Scan another
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {!scanResult && (
                    <QRScannerPanel
                      onScan={async (qrToken) => {
                        try {
                          const res = await fetch("/api/request/qr-verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ qrToken }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            setScanResult({ success: false, message: data.error || "Verification failed" });
                          } else {
                            setScanResult({
                              success: true,
                              message: `Request #${data.request._id.slice(-6).toUpperCase()} completed successfully`,
                              driverName: data.request.driverId?.name,
                              fuelType: data.request.fuelType,
                              amount: data.request.amount,
                            });
                            showToast("Ticket verified and completed!", "success");
                            refreshData();
                          }
                        } catch {
                          setScanResult({ success: false, message: "Network error during verification" });
                        }
                      }}
                      scannerMounted={scannerMounted}
                      setScannerMounted={setScannerMounted}
                    />
                  )}
                </motion.div>
              ) : activeTab === "analytics" ? (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-black text-slate-900">Performance Analytics</h3>
                    <div className="flex gap-2">
                      {(["today", "7d", "30d"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setAnalyticsRange(r)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${analyticsRange === r
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                          {r === "today" ? "Today" : r === "7d" ? "7 Days" : "30 Days"}
                        </button>
                      ))}
                      <button
                        onClick={exportCSV}
                        disabled={!analytics}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all disabled:opacity-50 font-bold"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  </div>

                  {loadingAnalytics || !analytics ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          { icon: Fuel, label: "Total Volume", value: `${analytics.totals?.totalLitres ?? 0}L`, color: "indigo" },
                          { icon: DollarSign, label: "Estimated Revenue", value: `${(analytics.totals?.totalRevenue ?? 0).toLocaleString()} ETB`, color: "emerald" },
                          { icon: Users, label: "Total Transactions", value: analytics.totals?.count ?? 0, color: "purple" }
                        ].map((metric) => (
                          <div key={metric.label} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`p-3 rounded-2xl bg-${metric.color}-50 border border-${metric.color}-100`}>
                                <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{metric.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analytics.byDay && analytics.byDay.length > 0 && (
                          <div className="bg-white rounded-xl p-5 border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-indigo-600" />
                              Sales Trend
                            </h4>
                            <Bar
                              data={{
                                labels: analytics.byDay.map((d) => `${d._id.d}/${d._id.m}`),
                                datasets: [
                                  {
                                    label: "Litres",
                                    data: analytics.byDay.map((d) => d.litres),
                                    backgroundColor: "rgba(79, 70, 229, 0.8)",
                                    borderRadius: 8,
                                  },
                                  {
                                    label: "Revenue (ETB)",
                                    data: analytics.byDay.map((d) => d.revenue),
                                    backgroundColor: "rgba(16, 185, 129, 0.8)",
                                    borderRadius: 8,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    labels: { color: "#64748b", font: { size: 11, weight: 'bold' } }
                                  }
                                },
                                scales: {
                                  x: { ticks: { color: "#94a3b8" }, grid: { display: false } },
                                  y: { ticks: { color: "#94a3b8" }, grid: { color: "#f1f5f9" } },
                                },
                              }}
                            />
                          </div>
                        )}

                        {analytics.byFuel && analytics.byFuel.length > 0 && (
                          <div className="bg-white rounded-xl p-5 border border-slate-200">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <Fuel className="w-4 h-4 text-amber-600" />
                              Fuel Distribution
                            </h4>
                            <div className="flex justify-center">
                              <Doughnut
                                data={{
                                  labels: analytics.byFuel.map((f) => f._id),
                                  datasets: [{
                                    data: analytics.byFuel.map((f) => f.litres),
                                    backgroundColor: ["rgba(79, 70, 229, 0.9)", "rgba(245, 158, 11, 0.9)"],
                                    borderColor: ["#ffffff", "#ffffff"],
                                    borderWidth: 4,
                                  }],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: true,
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                      labels: { color: "#64748b", padding: 20, font: { weight: 'bold' } }
                                    }
                                  },
                                  cutout: '70%',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Peak Hours Chart */}
                      {analytics.byHour && analytics.byHour.length > 0 && (
                        <div className="bg-white rounded-xl p-5 border border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            Peak Hours
                            <span className="ml-auto text-[10px] text-slate-400 font-normal uppercase tracking-widest">Requests by hour of day</span>
                          </h4>
                          <div className="h-48">
                            <Bar
                              data={{
                                labels: analytics.byHour.map(h => {
                                  const hr = h._id;
                                  return hr === 0 ? "12am" : hr < 12 ? `${hr}am` : hr === 12 ? "12pm" : `${hr - 12}pm`;
                                }),
                                datasets: [{
                                  label: "Requests",
                                  data: analytics.byHour.map(h => h.count),
                                  backgroundColor: analytics.byHour.map(h => {
                                    const maxCount = Math.max(...analytics.byHour.map(x => x.count));
                                    return h.count === maxCount ? "rgba(99, 102, 241, 0.9)" : "rgba(148, 163, 184, 0.5)";
                                  }),
                                  borderRadius: 6,
                                }],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                  x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { display: false } },
                                  y: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "#f1f5f9" }, beginAtZero: true },
                                },
                              }}
                            />
                          </div>
                          {analytics.byHour.length > 0 && (() => {
                            const peak = analytics.byHour.reduce((a, b) => a.count > b.count ? a : b);
                            const hr = peak._id;
                            const label = hr === 0 ? "12:00 AM" : hr < 12 ? `${hr}:00 AM` : hr === 12 ? "12:00 PM" : `${hr - 12}:00 PM`;
                            return (
                              <p className="text-xs text-slate-500 mt-3 font-medium">
                                🔥 Peak hour: <span className="text-indigo-600 font-bold">{label}</span> with <span className="font-bold">{peak.count}</span> requests
                              </p>
                            );
                          })()}
                        </div>
                      )}

                      {/* Price History Table */}
                      <div className="bg-white rounded-xl p-5 border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-rose-600" />
                          Price History
                        </h4>
                        {loadingPriceHistory ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                          </div>
                        ) : priceHistory.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <Fuel className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No price changes recorded yet</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="text-left py-3 px-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Fuel Type</th>
                                  <th className="text-left py-3 px-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Price (ETB/L)</th>
                                  <th className="text-left py-3 px-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Recorded At</th>
                                </tr>
                              </thead>
                              <tbody>
                                {priceHistory.map((p) => (
                                  <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-4">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${p.fuelType === "petrol"
                                        ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                        : "bg-amber-50 text-amber-600 border border-amber-100"
                                        }`}>
                                        {p.fuelType}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 font-black text-slate-900">{p.price.toLocaleString()} ETB</td>
                                    <td className="py-3 px-4 text-slate-500 font-medium">{formatDateTime(p.createdAt)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {activeTab === "pending" && pendingRequests.length > 0 && (
                    <ActionBar
                      left={
                        <>
                        <input
                          type="checkbox"
                          title="Select all pending requests"
                          checked={selectedPendingIds.length > 0 && selectedPendingIds.length === pendingRequests.length}
                          onChange={(e) =>
                            setSelectedPendingIds(e.target.checked ? pendingRequests.map((r) => r._id) : [])
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <p className="text-sm font-semibold text-slate-700">
                          {selectedPendingIds.length} selected
                        </p>
                        </>
                      }
                      right={
                        <>
                        <button
                          disabled={bulkLoading || selectedPendingIds.length === 0}
                          onClick={() => bulkUpdateRequests("REJECTED")}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100 disabled:opacity-50"
                        >
                          Reject Selected
                        </button>
                        <button
                          disabled={bulkLoading || selectedPendingIds.length === 0}
                          onClick={() => bulkUpdateRequests("APPROVED")}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white disabled:opacity-50"
                        >
                          Approve Selected
                        </button>
                        </>
                      }
                    />
                  )}

                  {(activeTab === "pending" ? pendingRequests : historyRequests).length === 0 ? (
                    <div className="text-center py-20">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4 border border-slate-100">
                        <Clock className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-900 font-bold">
                        {activeTab === "pending" ? "No pending requests" : "No history available"}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 font-medium">
                        {activeTab === "pending"
                          ? "All caught up! New requests will appear here."
                          : "Completed requests will show up here."}
                      </p>
                    </div>
                  ) : (
                    (activeTab === "pending" ? pendingRequests : historyRequests).map((r, idx) => (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ translateY: -5 }}
                        className="group relative overflow-hidden bg-white rounded-[2.5rem] p-8 border border-slate-200 hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl mb-6"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full" />
                        
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                          <div className="flex items-center gap-6">
                            {activeTab === "pending" && (
                              <input
                                type="checkbox"
                                title="Select request"
                                checked={selectedPendingIds.includes(r._id)}
                                onChange={() => togglePendingSelect(r._id)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                              />
                            )}
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center text-white font-black text-3xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500">
                              {r.driverId?.name?.charAt(0) ?? "?"}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{r.driverId?.name ?? "Guest Driver"}</h4>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  r.fuelType === "petrol" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                }`}>
                                  {r.fuelType === "petrol" ? "Benzene" : "Nafta"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  {formatDateTime(r.createdAt)}
                                </span>
                                {r.status === "PENDING" && r.createdAt && (() => {
                                  const ageMinutes = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 60000);
                                  const tone = ageMinutes >= 30 ? "bg-red-50 text-red-700 border-red-100" : ageMinutes >= 15 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100";
                                  return (
                                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${tone}`}>
                                      SLA {ageMinutes}m
                                    </span>
                                  );
                                })()}
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <StatusBadge
                                  label={r.status}
                                  tone={r.status === "PENDING" ? "warning" : r.status === "APPROVED" ? "success" : r.status === "COMPLETED" ? "info" : "danger"}
                                  className="text-[9px]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {r.status === "PENDING" ? (
                              <>
                                <button
                                  onClick={() => updateRequest(r._id, "REJECTED")}
                                  className="px-8 py-4 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-2xl transition-all active:scale-95"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => updateRequest(r._id, "APPROVED")}
                                  className="px-10 py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 hover:scale-105"
                                >
                                  Fill Fuel ✓
                                </button>
                              </>
                            ) : r.status === "APPROVED" ? (
                              <button
                                onClick={() => updateRequest(r._id, "COMPLETED")}
                                className="px-10 py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 hover:scale-105"
                              >
                                Complete ✓
                              </button>
                            ) : (
                              <div className="flex items-center gap-4">
                                <span className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.2em] border ${
                                  r.status === "COMPLETED" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                                  r.status === "CANCELED" ? "bg-slate-50 border-slate-100 text-slate-400" :
                                  "bg-red-50 border-red-100 text-red-600"
                                }`}>
                                  {r.status}
                                </span>
                                <button
                                title="oklo"
                                  onClick={() => removeRequest(r._id)}
                                  className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all group/btn border border-transparent hover:border-red-100"
                                >
                                  <XCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>

      <AnimatePresence>
        {stockModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !stockSaving && setStockModal((prev) => ({ ...prev, open: false }))}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Add {stockModal.fuelType === "petrol" ? "Petrol" : "Diesel"} Stock
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Enter litres to update inventory safely.
                  </p>
                </div>
                <button
                  onClick={() => setStockModal((prev) => ({ ...prev, open: false }))}
                  disabled={stockSaving}
                  className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    Quantity (Litres)
                  </label>
                  <input
                    type="number"
                    title="Stock amount in litres"
                    min={1}
                    value={stockModal.amount}
                    onChange={(e) =>
                      setStockModal((prev) => ({
                        ...prev,
                        amount: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <button
                  onClick={submitStockAdd}
                  disabled={stockSaving || stockModal.amount <= 0}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50 active:scale-95"
                >
                  {stockSaving ? "Saving..." : "Update Stock"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showAddStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !stationRegisterLoading && setShowAddStation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 w-fit mb-4 shadow-lg shadow-indigo-500/20">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register New Station</h3>
                 <p className="text-sm text-slate-500 mt-1 font-medium">Add a new fuel station branch to your network</p>
                </div>
                <button
                  onClick={() => setShowAddStation(false)}
                  disabled={stationRegisterLoading}
                  className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-900"
                >
                  ✕
                </button>
              </div>

             <form onSubmit={handleRegisterStation} className="space-y-6">
                <div>
                 <label htmlFor="station-name-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Station Name</label>
                  <input
                    id="station-name-input"
                    type="text"
                    required
                    placeholder="e.g., Central Fuel Depot"
                    value={stationForm.name}
                    onChange={(e) => setStationForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                   <label htmlFor="station-location-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Station Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="station-location-input"
                      type="text"
                      required
                      placeholder="Address or coordinates"
                      value={stationForm.location}
                      onChange={(e) => setStationForm(p => ({ ...p, location: e.target.value }))}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500  focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={stationRegisterLoading}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all  disabled:opacity-50 active:scale-95"
                >
                   {stationRegisterLoading ? "Synchronizing..." : "Register Station ✓"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
             className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-bold ${t.type === "success"
                ? "bg-white border-emerald-100 text-emerald-600"
                : t.type === "error"
                   ? "bg-white border-red-100 text-red-600"
                  : "bg-white border-indigo-100 text-indigo-600"
                }`}
            >
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                t.type === "success" ? "bg-emerald-50 text-emerald-600" :
                t.type === "error" ? "bg-red-50 text-red-600" :
                "bg-indigo-50 text-indigo-600"
              }`}>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
              <span className="flex-1">
                {typeof t.message === 'string' ? t.message : JSON.stringify(t.message)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}