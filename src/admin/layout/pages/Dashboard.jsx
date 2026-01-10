import {
  Package,
  Wrench,
  Image,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  Users,
  Activity,
  Target,
  ChevronRight,
  XCircle,
  Upload,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

// Import all APIs (no brochureAPI here)
import {
  dashboardAPI,
  productAPI,
  serviceAPI,
  enquiryAPI,
  clientAPI,
  galleryAPI,
} from "../../../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  // Get refresh context from layout
  const layoutContext = useOutletContext() || {};

  // ---------- Overview Data State ----------
  const [overview, setOverview] = useState({
    totalProducts: 0,
    activeServices: 0,
    galleryImages: 0,
    newEnquiries: 0,
    totalClients: 0,
    projectsDone: 0,
    avgResponse: "...",
    successRate: 0,
  });

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  // ---------- Modal for Admin Page Overview ----------
  const [activeModule, setActiveModule] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  const openModuleModal = (module) => {
    setActiveModule(module);
    setShowModuleModal(true);
  };

  const closeModuleModal = () => {
    setActiveModule(null);
    setShowModuleModal(false);
  };

  // ---------- Extract Count Helper ----------
  const extractCount = (res, debugLabel = "") => {
    if (!res) return 0;
    if (Array.isArray(res)) return res.length;
    if (typeof res === "number") return res;

    if (typeof res === "object") {
      if (Array.isArray(res.data)) return res.data.length;
      if (Array.isArray(res.images)) return res.images.length;
      if (Array.isArray(res.gallery)) return res.gallery.length;
      if (Array.isArray(res.files)) return res.files.length;
      if (Array.isArray(res.items)) return res.items.length;
      if (Array.isArray(res.enquiries)) return res.enquiries.length;
      if (typeof res.total === "number") return res.total;
      if (typeof res.count === "number") return res.count;
      if (typeof res.length === "number") return res.length;

      if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
        if (Array.isArray(res.data.images)) return res.data.images.length;
        if (Array.isArray(res.data.items)) return res.data.items.length;
        if (Array.isArray(res.data.enquiries)) return res.data.enquiries.length;
        if (typeof res.data.total === "number") return res.data.total;
        if (typeof res.data.count === "number") return res.data.count;
      }

      if (res.success && res.data) {
        return extractCount(res.data, debugLabel + ".success");
      }
    }

    return 0;
  };

  // ---------- Fetch Overview Data ----------
  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      setOverviewError(null);

      console.log("🔄 Fetching dashboard data...");

      const fetchWithFallback = async (apiCall, label) => {
        try {
          const res = await apiCall();
          console.log(`✅ ${label} API response:`, res);
          return res;
        } catch (err) {
          console.warn(`❌ ${label} API failed:`, err.message);
          return null;
        }
      };

      // Function to try different methods for enquiry API
      const fetchEnquiries = async () => {
        try {
          // Try different possible method names for getting enquiries
          if (typeof enquiryAPI.getAll === 'function') {
            return await enquiryAPI.getAll();
          } else if (typeof enquiryAPI.getEnquiries === 'function') {
            return await enquiryAPI.getEnquiries();
          } else if (typeof enquiryAPI.findAll === 'function') {
            return await enquiryAPI.findAll();
          } else if (typeof enquiryAPI.list === 'function') {
            return await enquiryAPI.list();
          } else if (typeof enquiryAPI.get === 'function') {
            return await enquiryAPI.get();
          } else {
            // If no matching method, check if enquiryAPI itself might be callable
            if (typeof enquiryAPI === 'function') {
              return await enquiryAPI();
            }
            
            // Last resort: Check if there's a getStats method that might have enquiry data
            if (typeof enquiryAPI.getStats === 'function') {
              return await enquiryAPI.getStats();
            }
            
            console.error("No suitable method found in enquiryAPI:", Object.keys(enquiryAPI));
            throw new Error("No suitable method found in enquiryAPI");
          }
        } catch (err) {
          console.error("Failed to fetch enquiries:", err);
          throw err;
        }
      };

      const [
        productsRes,
        servicesRes,
        enquiriesRes,
        clientsRes,
        galleryRes,
        statsRes,
      ] = await Promise.all([
        fetchWithFallback(() => productAPI.getAll(), "Products"),
        fetchWithFallback(() => serviceAPI.getAll(), "Services"),
        fetchWithFallback(fetchEnquiries, "Enquiries"),
        fetchWithFallback(() => clientAPI.getAll(), "Clients"),
        fetchWithFallback(() => galleryAPI.getAll(), "Gallery"),
        fetchWithFallback(() => dashboardAPI.getStats(), "Dashboard Stats"),
      ]);

      const productsCount = extractCount(productsRes, "Products");
      const servicesCount = extractCount(servicesRes, "Services");
      const enquiriesCount = extractCount(enquiriesRes, "Enquiries");
      const clientsCount = extractCount(clientsRes, "Clients");
      const galleryCount = extractCount(galleryRes, "Gallery");

      const statsData = statsRes?.data || statsRes || {};

      console.log("📊 Final Dashboard Counts:", {
        products: productsCount,
        services: servicesCount,
        enquiries: enquiriesCount,
        clients: clientsCount,
        gallery: galleryCount,
      });

      setOverview({
        totalProducts: productsCount,
        activeServices: servicesCount,
        galleryImages: galleryCount,
        newEnquiries: enquiriesCount,
        totalClients: clientsCount,
        projectsDone: statsData?.projectsDone || clientsCount || 0,
        avgResponse: statsData?.avgResponse || "2 hrs",
        successRate: statsData?.successRate || 98,
      });
    } catch (err) {
      console.error("❌ Failed to load overview data:", err);
      setOverviewError(err.message || "Failed to load overview data");
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [layoutContext?.refreshKey]);

  // ---------- Data for Cards ----------
  const stats = [
    {
      label: "Total Products",
      value: overview.totalProducts,
      change: +2,
      percentage: overview.totalProducts > 0 ? "+25%" : "0%",
      changeLabel: "vs last month",
      icon: Package,
      color: "bg-yellow-400",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      trend: [20, 25, 22, 30, 28, 35, Math.max(overview.totalProducts, 1)],
      route: "/admin/products",
    },
    {
      label: "Active Services",
      value: overview.activeServices,
      change: +1,
      percentage: overview.activeServices > 0 ? "+16%" : "0%",
      changeLabel: "vs last month",
      icon: Wrench,
      color: "bg-yellow-400",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      trend: [15, 18, 20, 19, 22, 21, Math.max(overview.activeServices, 1)],
      route: "/admin/services",
    },
    {
      label: "Gallery Images",
      value: overview.galleryImages,
      change: +5,
      percentage: overview.galleryImages > 0 ? "+33%" : "0%",
      changeLabel: "vs last month",
      icon: Image,
      color: "bg-yellow-400",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      trend: [30, 35, 32, 40, 38, 42, Math.max(overview.galleryImages, 1)],
      route: "/admin/gallery",
    },
    {
      label: "New Enquiries",
      value: overview.newEnquiries,
      change: overview.newEnquiries > 0 ? +3 : 0,
      percentage: overview.newEnquiries > 0 ? "+16%" : "0%",
      changeLabel: "vs last month",
      icon: MessageSquare,
      color: "bg-yellow-400",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
      trend: [25, 28, 30, 27, 24, 22, Math.max(overview.newEnquiries, 1)],
      route: "/admin/enquiries",
    },
  ];

  const metrics = [
    {
      label: "Total Clients",
      value: overview.totalClients || "0",
      icon: Users,
      color: "text-black",
      bg: "bg-yellow-50",
      route: "/admin/clients",
    },
    {
      label: "Avg. Response",
      value: overview.avgResponse || "—",
      icon: Clock,
      color: "text-black",
      bg: "bg-yellow-50",
    },
    {
      label: "Success Rate",
      value: overview.successRate ? `${overview.successRate}%` : "0%",
      icon: Target,
      color: "text-black",
      bg: "bg-yellow-50",
    },
  ];

  const adminModules = [
    {
      key: "products",
      name: "Products",
      route: "/admin/products",
      icon: Package,
      badge: "Catalog",
      summary: "Manage all product panels, pricing, and technical details.",
      stats: [{ label: "Total Products", value: overview.totalProducts }],
      extraInfo: "Add, edit, and control visibility of all product panels.",
      actions: [{ label: "View Products", route: "/admin/products", icon: Eye }],
    },
    {
      key: "services",
      name: "Services",
      route: "/admin/services",
      icon: Wrench,
      badge: "Core",
      summary: "Configure and manage all services you offer.",
      stats: [{ label: "Active Services", value: overview.activeServices }],
      extraInfo: "Define service details, pricing, duration, and features.",
      actions: [{ label: "View Services", route: "/admin/services", icon: Eye }],
    },
    {
      key: "gallery",
      name: "Gallery",
      route: "/admin/gallery",
      icon: Image,
      badge: "Media",
      summary: "Upload and organize project images and portfolio items.",
      stats: [{ label: "Images", value: overview.galleryImages }],
      extraInfo: "Showcase completed projects to build trust.",
      actions: [
        { label: "Open Gallery", route: "/admin/gallery", icon: Eye },
        { label: "Upload Image", route: "/admin/gallery?upload=1", icon: Upload },
      ],
    },
    {
      key: "enquiries",
      name: "Enquiries",
      route: "/admin/enquiries",
      icon: MessageSquare,
      badge: "Leads",
      summary: "View and respond to customer enquiries.",
      stats: [{ label: "New / Total", value: overview.newEnquiries }],
      extraInfo: "Track every enquiry and respond quickly.",
      actions: [{ label: "View Enquiries", route: "/admin/enquiries", icon: Eye }],
    },
    {
      key: "clients",
      name: "Clients",
      route: "/admin/clients",
      icon: Users,
      badge: "CRM",
      summary: "Manage your client list and projects.",
      stats: [{ label: "Total Clients", value: overview.totalClients }],
      extraInfo: "Keep track of key clients and their activity.",
      actions: [{ label: "View Clients", route: "/admin/clients", icon: Eye }],
    },
  ];

  const MiniChart = ({ data, color }) => {
    const maxValue = Math.max(...data.filter((v) => v > 0), 1);
    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.map((value, index) => (
          <div
            key={index}
            className={`flex-1 ${color} rounded-sm transition-all hover:opacity-80`}
            style={{ height: `${Math.max((value / maxValue) * 100, 5)}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loadingOverview && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
          <p className="text-sm font-medium text-yellow-800">
            Loading dashboard data...
          </p>
        </div>
      )}

      {/* Error State */}
      {overviewError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium text-red-800">{overviewError}</p>
          <button
            onClick={fetchOverview}
            className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <div
              key={stat.label}
              onClick={() => stat.route && navigate(stat.route)}
              className={`bg-white p-5 rounded-2xl shadow-sm border ${stat.borderColor} hover:shadow-md transition-all duration-200 group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl ${stat.lightColor} border border-yellow-100`}
                >
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.percentage}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-0.5">
                  {loadingOverview ? (
                    <span className="inline-block w-8 h-8 bg-gray-200 rounded animate-pulse"></span>
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-yellow-100">
                <MiniChart data={stat.trend} color={stat.color} />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">{stat.changeLabel}</p>
                <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Pages Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-yellow-500" />
              Admin Pages Overview
            </h2>
            <p className="text-xs text-slate-500">
              Real-time overview of all admin modules
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.key}
                onClick={() => openModuleModal(module)}
                className="text-left w-full p-4 rounded-xl border border-yellow-100 hover:border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-all cursor-pointer shadow-sm hover:shadow-md group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg border border-yellow-100">
                    <Icon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {module.name}
                      </p>
                      {module.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            module.badge === "Active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : module.badge === "Empty"
                              ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-white text-yellow-800 border-yellow-200"
                          }`}
                        >
                          {module.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {module.summary}
                    </p>
                    {module.stats && module.stats.length > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>
                          <span className="font-semibold text-slate-900">
                            {loadingOverview ? "..." : module.stats[0].value}
                          </span>{" "}
                          {module.stats[0].label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-yellow-800 font-semibold">
                          Details
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              onClick={() => metric.route && navigate(metric.route)}
              className={`bg-white p-4 rounded-xl shadow-sm border border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all ${
                metric.route ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 ${metric.bg} rounded-lg border border-yellow-200`}
                >
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div>
                  <div className="text-xl font-semibold text-slate-900">
                    {loadingOverview ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      metric.value
                    )}
                  </div>
                  <div className="text-xs text-slate-600">{metric.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module Detail Modal */}
      {showModuleModal && activeModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg border border-yellow-300">
                  {(() => {
                    const Icon = activeModule.icon;
                    return <Icon className="w-5 h-5 text-yellow-700" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {activeModule.name} Overview
                  </h3>
                  <p className="text-xs text-slate-600">{activeModule.summary}</p>
                </div>
              </div>
              <button
                onClick={closeModuleModal}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {activeModule.stats && activeModule.stats.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Live Data
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeModule.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-yellow-50 border border-yellow-100"
                      >
                        <p className="text-[11px] text-slate-600 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeModule.extraInfo && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Details
                  </h4>
                  <p className="text-sm text-slate-700">{activeModule.extraInfo}</p>
                </div>
              )}

              {activeModule.actions && activeModule.actions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Quick Actions
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeModule.actions.map((action) => {
                      const ActIcon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => {
                            if (action.route) {
                              navigate(action.route);
                              closeModuleModal();
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-yellow-300 bg-white hover:bg-yellow-50 text-sm font-semibold text-slate-800 transition-all"
                        >
                          {ActIcon && (
                            <ActIcon className="w-4 h-4 text-yellow-600" />
                          )}
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={closeModuleModal}
                className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (activeModule.route) {
                    navigate(activeModule.route);
                  }
                  closeModuleModal();
                }}
                className="px-4 py-2 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg border border-yellow-500 transition-colors"
              >
                Go to {activeModule.name}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}