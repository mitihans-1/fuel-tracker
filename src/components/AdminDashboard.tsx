"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title, Filler } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import SettingsPage from "@/app/dashboard/settings/page"; // reuse your file
import KpiCard from "@/components/ui/KpiCard";
import SectionHeader from "@/components/ui/SectionHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  Users, Fuel, MapPin, Settings,
  Trash2, UserPlus, Shield, Search,
  DollarSign, Activity, ExternalLink,
  LayoutDashboard, Menu, LogOut, History, X, Upload, XCircle
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Title, Filler);

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Station {
  _id: string;
  name: string;
  location: string;
  petrol: boolean;
  diesel: boolean;
  ownerUserId?: string;
  verificationDoc?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

interface FuelRequest {
  _id: string;
  fuelType: string;
  status: string;
  paymentStatus?: string;
  refundStatus?: "NONE" | "PROCESSED";
  driverId?: { name: string };
  stationId?: { name: string };
  createdAt?: string;
}

interface AdminAnalytics {
  byDay: { _id: { y: number; m: number; d: number; fuelType: string }; count: number; litres: number; revenue: number }[];
  fuelBreakdown: { _id: string; count: number; litres: number; revenue: number }[];
  topStations: { name: string; count: number; revenue: number; litres: number }[];
  totals: {
    requests: number;
    litres: number;
    grossRevenue: number;
    stationEarnings: number;
    platformCommission: number;
    approved: number;
    completed: number;
    pending: number;
  };
  stationCount: number;
}

interface CreateStationForm {
  name: string;
  location: string;
  zone: string;
  woreda: string;
  kebele: string;
  email: string;
  password: string;
}

type Tab = "users" | "stations" | "requests" | "analytics" | "payouts" | "audit" | "settings" | "products";

interface PayoutStationSummary {
  stationId: string;
  stationName: string;
  pendingAmount: number;
  paidAmount: number;
  pendingCount: number;
  paidCount: number;
}

interface PayoutSummaryResponse {
  totals: {
    pendingAmount: number;
    paidAmount: number;
    pendingCount: number;
    paidCount: number;
  };
  stations: PayoutStationSummary[];
}

interface AuditLogItem {
  _id: string;
  actorRole: "ADMIN" | "STATION" | "DRIVER";
  action: string;
  targetType: string;
  targetId?: string;
  createdAt?: string;
}

interface Product {
  _id?: string;
  name: string;
  category: "petrol" | "diesel";
  price: string;
  image: string;
  desc: string;
  features: string[];
  order: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { clear } = useUser();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [requests, setRequests] = useState<FuelRequest[]>([]);
  const [searchUser, setSearchUser] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tab = (searchParams.get("tab") as Tab) || "analytics";

  const sidebarItems: { id: Tab; label: string; icon: React.ReactNode; color: string; activeBg: string; activeBorder: string; gradientText: string }[] = [
    { id: "analytics", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, color: "text-indigo-500", activeBg: "bg-indigo-50/80", activeBorder: "border-indigo-200/60", gradientText: "from-indigo-600 via-purple-600 to-indigo-600" },
    { id: "payouts", label: "Payout Center", icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-500", activeBg: "bg-emerald-50/80", activeBorder: "border-emerald-200/60", gradientText: "from-emerald-600 to-teal-600" },
    { id: "audit", label: "Audit Logs", icon: <Shield className="w-5 h-5" />, color: "text-blue-500", activeBg: "bg-blue-50/80", activeBorder: "border-blue-200/60", gradientText: "from-blue-600 to-cyan-600" },
    { id: "users", label: "Users", icon: <Users className="w-5 h-5" />, color: "text-amber-500", activeBg: "bg-amber-50/80", activeBorder: "border-amber-200/60", gradientText: "from-amber-600 to-orange-600" },
    { id: "stations", label: "Stations", icon: <MapPin className="w-5 h-5" />, color: "text-rose-500", activeBg: "bg-rose-50/80", activeBorder: "border-rose-200/60", gradientText: "from-rose-500 to-red-600" },
    { id: "requests", label: "Requests", icon: <History className="w-5 h-5" />, color: "text-purple-500", activeBg: "bg-purple-50/80", activeBorder: "border-purple-200/60", gradientText: "from-purple-600 to-pink-600" },
    { id: "products", label: "Products", icon: <Fuel className="w-5 h-5" />, color: "text-indigo-500", activeBg: "bg-indigo-50/80", activeBorder: "border-indigo-200/60", gradientText: "from-indigo-600 via-purple-600 to-indigo-600" },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" />, color: "text-slate-500", activeBg: "bg-slate-100/80", activeBorder: "border-slate-300/60", gradientText: "from-slate-600 to-slate-800" },
  ];

  const [analyticsRange] = useState<"7d" | "30d">("30d");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [stationFilter, setStationFilter] = useState<"APPROVED" | "PENDING">("APPROVED");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<PayoutSummaryResponse | null>(null);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [settlingStationId, setSettlingStationId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [showCreateStation, setShowCreateStation] = useState(false);
  const [createForm, setCreateForm] = useState<CreateStationForm>({
    name: "",
    location: "",
    zone: "",
    woreda: "",
    kebele: "",
    email: "",
    password: ""
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "DRIVER" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Product>({
    name: "",
    category: "petrol",
    price: "",
    image: "",
    desc: "",
    features: [],
    order: 0
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    clear();
    fetch("/api/auth/logout", { method: "POST", keepalive: true }).catch(console.error);
    router.replace("/auth/login");
  };

  const setTab = useCallback((t: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.push(`${window.location.pathname}?${params.toString()}`);
    setMobileMenuOpen(false);
  }, [router, searchParams]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "register") {
      setShowCreateStation(true);
      setTab("stations");
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, setTab]);

  const loadAnalytics = useCallback(async (range: "7d" | "30d") => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (res.ok) setAnalytics(await res.json());
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const loadPayouts = useCallback(async () => {
    try {
      setLoadingPayouts(true);
      const res = await fetch("/api/admin/payouts");
      if (res.ok) setPayouts(await res.json());
    } finally {
      setLoadingPayouts(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoadingAuditLogs(true);
      const res = await fetch("/api/admin/audit-logs?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } finally {
      setLoadingAuditLogs(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, stationsRes, requestsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/stations"),
          fetch("/api/admin/requests"),
        ]);
        const usersData = await usersRes.json();
        const stationsData = await stationsRes.json();
        const requestsData = await requestsRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
        setStations(Array.isArray(stationsData) ? stationsData : []);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } catch { /* silent */ }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tab === "analytics") loadAnalytics(analyticsRange);
    if (tab === "payouts") loadPayouts();
    if (tab === "audit") loadAuditLogs();
    if (tab === "products") loadProducts();
  }, [tab, analyticsRange, loadAnalytics, loadPayouts, loadAuditLogs, loadProducts]);

  const settleStationPayout = async (stationId: string) => {
    try {
      setSettlingStationId(stationId);
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId }),
      });
      if (res.ok) await loadPayouts();
    } finally {
      setSettlingStationId(null);
    }
  };

  const processRefund = async (requestId: string) => {
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) return;
      const [usersRes, stationsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stations"),
        fetch("/api/admin/requests"),
      ]);
      const usersData = await usersRes.json();
      const stationsData = await stationsRes.json();
      const requestsData = await requestsRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);
      setStations(Array.isArray(stationsData) ? stationsData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
      await Promise.all([loadAnalytics(analyticsRange), loadPayouts()]);
    } catch {
      // silent
    }
  };

  const stats = {
    users: users.length,
    drivers: users.filter(u => u.role === "DRIVER").length,
    stations: stations.length,
    requests: requests.length,
    pending: requests.filter(r => r.status === "PENDING").length,
    approved: requests.filter(r => r.status === "APPROVED").length,
  };

  const platformSignals = {
    activeStations: stations.filter(s => s.petrol || s.diesel).length,
    idleStations: stations.filter(s => !s.petrol && !s.diesel).length,
    approvalRate: requests.length === 0 ? 0 : Math.round((requests.filter(r => r.status === "APPROVED").length / requests.length) * 100),
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/admin/delete?id=${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u._id !== id));
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()));

  const handleCreateStation = async () => {
    setCreateError("");
    if (!createForm.name.trim() || !createForm.location.trim()) {
      setCreateError("Name and location are required.");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error || "Failed to create station"); return; }
      setStations(prev => [...prev, data.station || data]);
      setCreateForm({ name: "", location: "", zone: "", woreda: "", kebele: "", email: "", password: "" });
      setTimeout(() => { setShowCreateStation(false); }, 1800);
    } catch { setCreateError("Network error"); } finally { setCreateLoading(false); }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
    } catch (err) { console.error("Update role failed:", err); }
  };

  const handleCreateUser = async () => {
    setUserError("");
    if (!userForm.email || !userForm.password || !userForm.name) { setUserError("All fields are required"); return; }
    setUserLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const data = await res.json();
      if (!res.ok) { setUserError(data.error || "Failed to create user"); return; }
      setUsers(prev => [...prev, data]);
      setUserForm({ name: "", email: "", password: "", role: "DRIVER" });
      setTimeout(() => { setShowCreateUser(false); }, 1500);
    } catch { setUserError("Network error"); } finally { setUserLoading(false); }
  };

  const handleSaveProduct = async () => {
    setProductError("");
    if (!productForm.name || !productForm.price || !productForm.image) {
      setProductError("Name, price and image are required");
      return;
    }
    setProductLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct ? { ...productForm, _id: editingProduct._id } : productForm),
      });
      if (res.ok) {
        await loadProducts();
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: "", category: "petrol", price: "", image: "", desc: "", features: [], order: 0 });
      } else {
        const data = await res.json();
        setProductError(data.error || "Failed to save product");
      }
    } catch {
      setProductError("Network error");
    } finally {
      setProductLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProductError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setProductForm({ ...productForm, image: data.url });
      } else {
        setProductError(data.details ? `${data.error}: ${data.details}` : (data.error || "Upload failed"));
      }
    } catch (err) {
      setProductError("Upload network error");
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyStation = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      setVerifyingId(id);
      const res = await fetch("/api/admin/verify-station", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: id, status }),
      });
      if (res.ok) {
        setStations(prev => prev.map(s => s._id === id ? { ...s, verificationStatus: status } : s));
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the station and all related history.")) return;
    try {
      setVerifyingId(id);
      const res = await fetch("/api/stations/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stationId: id }),
      });
      if (res.ok) {
        setStations(prev => prev.filter(s => s._id !== id));
      }
    } finally {
      setVerifyingId(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete product failed:", err);
    }
  };

  const buildRequestsOverTime = () => {
    if (!analytics?.byDay) return null;
    const dayMap = new Map<string, { total: number }>();
    for (const d of analytics.byDay) {
      const key = `${d._id.d}/${d._id.m}`;
      const existing = dayMap.get(key) ?? { total: 0 };
      existing.total += d.count;
      dayMap.set(key, existing);
    }
    const labels = [...dayMap.keys()];
    const totals = labels.map(k => dayMap.get(k)!.total);
    return { labels, totals };
  };

  const requestsOverTime = buildRequestsOverTime();

  const analyticsPage = sidebarItems.find(i => i.id === "analytics")!;

  return (
    <div className="dashboard-root dashboard-shell min-h-screen">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          title="mobile"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 pro-surface border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="p-6 pt-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">FuelAdmin</h1>
            <button
              title="mobile"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            {sidebarItems.map((item) => {
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                    isActive
                      ? `${item.activeBg} shadow-sm border ${item.activeBorder}`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <div className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                    <div className={item.color}>
                      {item.icon}
                    </div>
                  </div>
                  <span className={`font-bold tracking-wide ${
                    isActive 
                      ? `bg-clip-text text-transparent bg-gradient-to-r ${item.gradientText}` 
                      : "text-slate-600 font-medium"
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
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

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen pt-16 lg:pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="dashboard-content space-y-8">
          <AnimatePresence mode="wait">
            {tab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <SectionHeader
                    title="Users"
                    subtitle="Manage platform users and their roles"
                    gradientClass={sidebarItems.find(i => i.id === tab)?.gradientText}
                  />
                  <div className="flex gap-3">
                    <div className="relative flex-1 sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchUser}
                        onChange={e => setSearchUser(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setShowCreateUser(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>

                <div className="pro-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-600 text-sm font-medium">{u.name.charAt(0)}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                            <td className="px-6 py-4">
                              <select
                                title="update"
                                value={u.role}
                                onChange={(e) => updateUserRole(u._id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${u.role === "ADMIN"
                                  ? "border-purple-200 bg-purple-50 text-purple-700"
                                  : u.role === "STATION"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  }`}
                              >
                                <option value="DRIVER">Driver</option>
                                <option value="STATION">Station</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                title="delete"
                                onClick={() => deleteUser(u._id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "stations" && (
              <motion.div
                key="stations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <SectionHeader
                      title="Stations"
                      subtitle="Manage fuel stations and their status"
                      gradientClass={sidebarItems.find(i => i.id === tab)?.gradientText}
                    />
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => setStationFilter("APPROVED")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${stationFilter === "APPROVED" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      >
                        Approved Stations
                      </button>
                      <button 
                        onClick={() => setStationFilter("PENDING")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${stationFilter === "PENDING" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                      >
                        Verification Queue
                        {stations.filter(s => s.verificationStatus === "PENDING").length > 0 && (
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{stations.filter(s => s.verificationStatus === "PENDING").length}</span>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateStation(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Station
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stations.filter(s => stationFilter === "PENDING" ? s.verificationStatus === "PENDING" : (s.verificationStatus === "APPROVED" || !s.verificationStatus)).map((s) => (
                    <div key={s._id} className="pro-card p-6 transition-shadow group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{s.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">{s.location}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${s.verificationStatus === "PENDING" 
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : s.petrol || s.diesel
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                          }`}>
                          {s.verificationStatus === "PENDING" ? "Awaiting Review" : (s.petrol || s.diesel ? "Active" : "Inactive")}
                        </div>
                      </div>

                      {s.verificationStatus === "PENDING" ? (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Government Document</p>
                            <a 
                              href={s.verificationDoc} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <ExternalLink className="w-4 h-4" />
                              </div>
                              View Submitted Permit
                            </a>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerifyStation(s._id, "APPROVED")}
                              disabled={!!verifyingId}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                            >
                              {verifyingId === s._id ? "Processing..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleVerifyStation(s._id, "REJECTED")}
                              disabled={!!verifyingId}
                              className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-xs text-gray-500">Petrol</span>
                              <span className={`text-xs font-medium ${s.petrol ? "text-emerald-600" : "text-gray-400"}`}>
                                {s.petrol ? "Available" : "Unavailable"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-xs text-gray-500">Diesel</span>
                              <span className={`text-xs font-medium ${s.diesel ? "text-emerald-600" : "text-gray-400"}`}>
                                {s.diesel ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDeleteStation(s._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Station Permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVerifyStation(s._id, "REJECTED")}
                                className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Deactivate (Suspend) Station"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                              Configure
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {stations.filter(s => stationFilter === "PENDING" ? s.verificationStatus === "PENDING" : (s.verificationStatus === "APPROVED" || !s.verificationStatus)).length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium italic">No {stationFilter.toLowerCase()} stations found.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "requests" && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <SectionHeader
                  title="Fuel Requests"
                  subtitle="Monitor and manage fuel requests"
                  gradientClass={sidebarItems.find(i => i.id === tab)?.gradientText}
                />

                <div className="pro-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Driver</th>
                          <th className="px-6 py-3">Station</th>
                          <th className="px-6 py-3">Fuel Type</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Payment</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {requests.map((r) => (
                          <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-900">{r.driverId?.name || "N/A"}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{r.stationId?.name || "N/A"}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium ${r.fuelType === "petrol" ? "text-indigo-600" : "text-amber-600"
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${r.fuelType === "petrol" ? "bg-indigo-500" : "bg-amber-500"
                                  }`} />
                                {r.fuelType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge
                                label={r.status}
                                tone={r.status === "PENDING" ? "warning" : r.status === "APPROVED" ? "success" : "danger"}
                                className="text-xs font-medium normal-case tracking-normal px-2 py-1"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.paymentStatus === "REFUNDED"
                                ? "bg-red-50 text-red-700"
                                : r.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                                }`}>
                                {r.paymentStatus || "PENDING"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {r.paymentStatus === "PAID" && r.refundStatus !== "PROCESSED" ? (
                                <button
                                  onClick={() => processRefund(r._id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                                >
                                  Refund
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "payouts" && (
              <motion.div
                key="payouts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <SectionHeader
                  title="Payout Center"
                  subtitle="Settle completed request balances for stations."
                  gradientClass={sidebarItems.find(i => i.id === tab)?.gradientText}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <KpiCard label="Pending Balance" value={`${(payouts?.totals.pendingAmount ?? 0).toLocaleString()} ETB`} />
                  <KpiCard label="Total Paid Out" value={`${(payouts?.totals.paidAmount ?? 0).toLocaleString()} ETB`} />
                  <KpiCard label="Pending Tickets" value={(payouts?.totals.pendingCount ?? 0).toLocaleString()} />
                </div>

                <div className="pro-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Station</th>
                          <th className="px-6 py-3">Pending Amount</th>
                          <th className="px-6 py-3">Paid Amount</th>
                          <th className="px-6 py-3">Pending Tickets</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingPayouts ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading payouts...</td>
                          </tr>
                        ) : (payouts?.stations ?? []).length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No payout records yet.</td>
                          </tr>
                        ) : (
                          (payouts?.stations ?? []).map((row) => (
                            <tr key={row.stationId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.stationName}</td>
                              <td className="px-6 py-4 text-sm text-amber-700 font-semibold">{row.pendingAmount.toLocaleString()} ETB</td>
                              <td className="px-6 py-4 text-sm text-emerald-700 font-semibold">{row.paidAmount.toLocaleString()} ETB</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{row.pendingCount}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => settleStationPayout(row.stationId)}
                                  disabled={row.pendingCount === 0 || settlingStationId === row.stationId}
                                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white disabled:opacity-40"
                                >
                                  {settlingStationId === row.stationId ? "Settling..." : "Settle Payout"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Hero Section / Purpose */}
                <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden shadow-xl border border-indigo-500/20 bg-slate-900">
                  <img src="/images/dashboard-illustration.png" className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Platform Control" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-900/60 to-transparent" />
                  <div className="relative h-full flex flex-col justify-center p-8 sm:p-10">
                    <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">Executive Command Center</h2>
                    <p className="text-sm sm:text-base text-indigo-100 font-medium max-w-lg leading-relaxed">
                      Oversee the entire fuel ecosystem. Manage user access, monitor station health, and analyze nationwide fuel distribution trends in real-time.
                    </p>
                  </div>
                </div>

                <SectionHeader
                  title="Overview & Analytics"
                  subtitle="Platform-wide performance and distribution insights"
                  gradientClass={analyticsPage.gradientText}
                />



                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Users", value: stats.users, icon: Users, color: "bg-indigo-50 text-indigo-600" },
                    { label: "Drivers", value: stats.drivers, icon: Activity, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Stations", value: stats.stations, icon: Fuel, color: "bg-amber-50 text-amber-600" },
                    { label: "Total Requests", value: stats.requests, icon: History, color: "bg-purple-50 text-purple-600" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg ${s.color}`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-2xl font-semibold text-gray-900">{s.value.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Station Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Active Stations</span>
                        <span className="font-medium text-gray-900">{platformSignals.activeStations}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Inactive Stations</span>
                        <span className="font-medium text-gray-900">{platformSignals.idleStations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Approval Rate</h3>
                    <div>
                      <p className="text-3xl font-semibold text-gray-900">{platformSignals.approvalRate}%</p>
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <progress
                          className="block w-full h-full appearance-none border-none bg-transparent [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-indigo-600 [&::-moz-progress-bar]:bg-indigo-600"
                          value={platformSignals.approvalRate}
                          max="100"
                        >
                          {platformSignals.approvalRate}%
                        </progress>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Pending Requests</h3>
                    <p className="text-3xl font-semibold text-amber-600">{stats.pending}</p>
                    <p className="text-sm text-gray-500 mt-2">Awaiting approval</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-emerald-100 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Platform Balance</h3>
                    <p className="text-3xl font-semibold text-emerald-600">
                      {(analytics?.totals?.platformCommission ?? 0).toLocaleString()} ETB
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Commission earned by platform</p>
                  </div>
                  <div className="bg-white rounded-xl border border-indigo-100 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Station Payouts</h3>
                    <p className="text-3xl font-semibold text-indigo-600">
                      {(analytics?.totals?.stationEarnings ?? 0).toLocaleString()} ETB
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Net amount owed/paid to stations</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Gross Processed</h3>
                    <p className="text-3xl font-semibold text-slate-900">
                      {(analytics?.totals?.grossRevenue ?? 0).toLocaleString()} ETB
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Total fuel payment volume</p>
                  </div>
                </div>

                {/* Charts Section */}
                {loadingAnalytics || !analytics ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-6">Requests Over Time</h3>
                      <div className="h-80">
                        {requestsOverTime && requestsOverTime.labels.length > 0 && (
                          <Line
                            data={{
                              labels: requestsOverTime.labels,
                              datasets: [{
                                label: "Requests",
                                data: requestsOverTime.totals,
                                borderColor: "#6366f1",
                                backgroundColor: "transparent",
                                borderWidth: 2,
                                pointRadius: 0,
                                tension: 0.4,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: { backgroundColor: "#1f2937" }
                              },
                              scales: {
                                x: { grid: { display: false }, ticks: { color: "#6b7280" } },
                                y: { grid: { color: "#e5e7eb" }, ticks: { color: "#6b7280" }, beginAtZero: true }
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-6">Fuel Type Distribution</h3>
                      <div className="h-48 mb-6">
                        {analytics.fuelBreakdown && analytics.fuelBreakdown.length > 0 && (
                          <Doughnut
                            data={{
                              labels: analytics.fuelBreakdown.map(f => f._id.toUpperCase()),
                              datasets: [{
                                data: analytics.fuelBreakdown.map(f => f.count),
                                backgroundColor: ["#6366f1", "#f59e0b"],
                                borderWidth: 0,
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              cutout: "70%",
                              plugins: { legend: { display: false } }
                            }}
                          />
                        )}
                      </div>
                      <div className="space-y-3">
                        {analytics.fuelBreakdown.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${idx === 0 ? "bg-indigo-500" : "bg-amber-500"}`} />
                              <span className="text-sm font-medium text-gray-700">{f._id}</span>
                            </div>
                            <span className="text-sm text-gray-600">{f.count} requests</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === "audit" && (
              <motion.div
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <SectionHeader
                  title="Audit Logs"
                  subtitle="Track sensitive actions for security and accountability."
                  gradientClass={sidebarItems.find(i => i.id === tab)?.gradientText}
                />

                <div className="pro-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-6 py-3">Time</th>
                          <th className="px-6 py-3">Actor Role</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">Target</th>
                          <th className="px-6 py-3">Target ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {loadingAuditLogs ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Loading audit logs...</td>
                          </tr>
                        ) : auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No audit entries found.</td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge
                                  label={log.actorRole}
                                  tone={log.actorRole === "ADMIN" ? "info" : log.actorRole === "STATION" ? "warning" : "neutral"}
                                  className="text-xs font-medium normal-case tracking-normal px-2 py-1"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.action}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{log.targetType}</td>
                              <td className="px-6 py-4 text-xs text-gray-500 font-mono">{log.targetId || "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "products" && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <SectionHeader
                    title="Products"
                    subtitle="Manage products shown on the home page"
                    gradientClass={sidebarItems.find(i => i.id === tab)?.gradientText}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: "", category: "petrol", price: "", image: "", desc: "", features: [], order: 0 });
                      setShowProductModal(true);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loadingProducts ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Loading products...</div>
                  ) : products.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500">No products found.</div>
                  ) : (
                    products.map((p) => (
                      <div key={p._id} className="pro-card overflow-hidden transition-shadow group">
                        <div className="relative h-40 overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-indigo-600 font-bold text-xs shadow-sm">
                            {p.price} ETB/L
                          </div>
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            p.category === "petrol" ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"
                          }`}>
                            {p.category}
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{p.desc}</p>
                          <div className="flex flex-wrap gap-1">
                            {p.features.slice(0, 3).map((f, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-medium">
                                {f}
                              </span>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 font-medium">Order: {p.order}</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                title="Edit Product"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductForm({ ...p });
                                  setShowProductModal(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Delete Product"
                                onClick={() => deleteProduct(p._id!)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCreateStation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateStation(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Station</h3>
                <p className="text-sm text-gray-500">Register a new fuel station</p>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Station Name</label>
                    <input
                      title="name"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.name}
                      onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Location (Address)</label>
                    <input
                      title="location"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.location}
                      onChange={e => setCreateForm({ ...createForm, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                    <input
                      title="zone"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.zone}
                      onChange={e => setCreateForm({ ...createForm, zone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Woreda</label>
                    <input
                      title="woreda"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.woreda}
                      onChange={e => setCreateForm({ ...createForm, woreda: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Kebele</label>
                    <input
                      title="kebele"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.kebele}
                      onChange={e => setCreateForm({ ...createForm, kebele: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Manager Credentials</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      title="email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.email}
                      onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                    <input
                      title="password"
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={createForm.password}
                      onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateStation(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStation}
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createLoading ? "Creating..." : "Create Station"}
                  </button>
                </div>
                {createError && <p className="mt-3 text-xs text-red-600 font-medium">{createError}</p>}
              </div>
            </motion.div>
          </div>
        )}

        {showCreateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateUser(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add User</h3>
              <p className="text-sm text-gray-500 mb-6">Create a new platform user</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    title="name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    title="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input
                    title="password"
                    type="password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["DRIVER", "STATION", "ADMIN"].map(r => (
                      <button
                        key={r}
                        onClick={() => setUserForm({ ...userForm, role: r })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${userForm.role === r
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {userError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{userError}</p>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={userLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    {userLoading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h3>
                  <button
                    title="close"
                    onClick={() => setShowProductModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {productError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
                      {productError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="productName" className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Name</label>
                      <input
                        id="productName"
                        type="text"
                        placeholder="Super Premium 98"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="productCategory" className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Category</label>
                      <select
                        id="productCategory"
                        title="category"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm cursor-pointer"
                        value={productForm.category}
                        onChange={e => setProductForm({ ...productForm, category: e.target.value as "petrol" | "diesel" })}
                      >
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="productPrice" className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Price (ETB/L)</label>
                      <input
                        id="productPrice"
                        type="text"
                        placeholder="85.50"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        value={productForm.price}
                        onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="productOrder" className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Display Order</label>
                      <input
                        id="productOrder"
                        type="number"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                        value={productForm.order}
                        onChange={e => setProductForm({ ...productForm, order: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Product Image</label>
                    <div className="flex flex-col gap-4">
                      {productForm.image && (
                        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-100">
                          <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            title="Remove Image"
                            onClick={() => setProductForm({ ...productForm, image: "" })}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          {uploading ? (
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                              <span className="text-xs font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">
                                {productForm.image ? "Change Image" : "Upload Image"}
                              </span>
                            </>
                          )}
                        </label>
                        <div className="flex-[2] space-y-2">
                          <label htmlFor="productImage" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Or Image URL</label>
                          <input
                            id="productImage"
                            type="text"
                            placeholder="https://images.pexels.com/..."
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={productForm.image}
                            onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="productDesc" className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Description</label>
                    <textarea
                      id="productDesc"
                      placeholder="Highest octane rating for maximum engine performance..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm min-h-[100px]"
                      value={productForm.desc}
                      onChange={e => setProductForm({ ...productForm, desc: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="productFeatures" className="text-xs font-black text-gray-700 uppercase tracking-widest ml-1 drop-shadow-sm">Features (comma separated)</label>
                    <input
                      id="productFeatures"
                      type="text"
                      placeholder="Octane 98, Engine Cleaning, Anti-Knock"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                      value={productForm.features.join(", ")}
                      onChange={e => setProductForm({ ...productForm, features: e.target.value.split(",").map(f => f.trim()).filter(f => f !== "") })}
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    disabled={productLoading}
                    className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {productLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingProduct ? "Update Product" : "Create Product"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}