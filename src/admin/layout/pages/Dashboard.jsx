// client/src/pages/admin/Dashboard.jsx
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
  FileText,
  CheckCircle2,
  Download,
  Trash2,
  Loader2,
  Clock,
  Star,
  CheckCircle,
  Briefcase,
  Shield,
  Zap,
  Factory,
  Building2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

// Import all APIs including brochure
import {
  dashboardAPI,
  productAPI,
  serviceAPI,
  enquiryAPI,
  clientAPI,
  galleryAPI,
  brochureAPI,
} from "../../../api/axios";

export default function Dashboard() {
  const fileInputRef = useRef(null);
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
    totalBrochures: 0,
    activeBrochure: null,
  });

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  // Brochure Upload States
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [deletingBrochure, setDeletingBrochure] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [brochureTitle, setBrochureTitle] = useState("");
  const [brochureDescription, setBrochureDescription] = useState("");
  const [selectedBrochureFile, setSelectedBrochureFile] = useState(null);

  // ---------- Modal for Admin Page Overview ----------
  const [activeModule, setActiveModule] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  // ---------- Brochure Functions ----------
  const handleBrochureClick = () => {
    setShowBrochureModal(true);
  };

  const handleBrochureFileSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid document file (PDF, DOC, DOCX, PPT, PPTX)");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setSelectedBrochureFile(file);
    console.log("Selected brochure file:", file);
  };

  const handleBrochureUpload = async () => {
    if (!selectedBrochureFile) {
      alert("Please select a file");
      return;
    }

    if (!brochureTitle.trim()) {
      alert("Please enter a title for the brochure");
      return;
    }

    setUploadingBrochure(true);

    try {
      if (overview.activeBrochure) {
        console.log("🗑️ Deleting existing brochure first...");
        await brochureAPI.delete(overview.activeBrochure._id);
      }

      const response = await brochureAPI.uploadBrochure(selectedBrochureFile, {
        title: brochureTitle.trim(),
        description: brochureDescription.trim(),
        isActive: true,
      });

      if (response.success) {
        alert("✅ Brochure uploaded successfully!");
        resetBrochureForm();
        fetchOverview();
      }
    } catch (error) {
      console.error("Brochure upload error:", error);
      alert(error.message || "Failed to upload brochure");
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handleDeleteBrochure = async () => {
    if (!overview.activeBrochure) return;

    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete the current brochure?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingBrochure(true);

    try {
      const response = await brochureAPI.delete(overview.activeBrochure._id);

      if (response.success) {
        alert("✅ Brochure deleted successfully");
        setShowBrochureModal(false);
        fetchOverview();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete brochure");
    } finally {
      setDeletingBrochure(false);
    }
  };

  const handleDownloadBrochure = () => {
    if (!overview.activeBrochure) return;

    const downloadUrl = brochureAPI.getDownloadUrl(
      overview.activeBrochure.fileUrl
    );
    window.open(downloadUrl, "_blank");
  };

  const resetBrochureForm = () => {
    setSelectedBrochureFile(null);
    setBrochureTitle("");
    setBrochureDescription("");
    setShowBrochureModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ---------- Navigation Helpers ----------
  const handleViewBrochures = () => {
    navigate("/admin/brochures");
    setShowBrochureModal(false);
  };

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
      if (typeof res.total === "number") return res.total;
      if (typeof res.count === "number") return res.count;
      if (typeof res.length === "number") return res.length;

      if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
        if (Array.isArray(res.data.images)) return res.data.images.length;
        if (Array.isArray(res.data.items)) return res.data.items.length;
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

      const [
        productsRes,
        servicesRes,
        enquiriesRes,
        clientsRes,
        galleryRes,
        brochuresRes,
        activeBrochureRes,
        statsRes,
      ] = await Promise.all([
        fetchWithFallback(() => productAPI.getAll(), "Products"),
        fetchWithFallback(() => serviceAPI.getAll(), "Services"),
        fetchWithFallback(() => enquiryAPI.getAll(), "Enquiries"),
        fetchWithFallback(() => clientAPI.getAll(), "Clients"),
        fetchWithFallback(() => galleryAPI.getAll(), "Gallery"),
        fetchWithFallback(() => brochureAPI.getAll(), "Brochures"),
        fetchWithFallback(() => brochureAPI.getActive(), "Active Brochure"),
        fetchWithFallback(() => dashboardAPI.getStats(), "Dashboard Stats"),
      ]);

      const productsCount = extractCount(productsRes, "Products");
      const servicesCount = extractCount(servicesRes, "Services");
      const enquiriesCount = extractCount(enquiriesRes, "Enquiries");
      const clientsCount = extractCount(clientsRes, "Clients");
      const galleryCount = extractCount(galleryRes, "Gallery");
      const brochuresCount = extractCount(brochuresRes, "Brochures");

      const statsData = statsRes?.data || statsRes || {};
      const activeBrochureData =
        activeBrochureRes?.success && activeBrochureRes?.data
          ? activeBrochureRes.data
          : null;

      console.log("📊 Final Dashboard Counts:", {
        products: productsCount,
        services: servicesCount,
        enquiries: enquiriesCount,
        clients: clientsCount,
        gallery: galleryCount,
        brochures: brochuresCount,
        activeBrochure: activeBrochureData,
      });

      setOverview({
        totalProducts: productsCount,
        activeServices: servicesCount,
        galleryImages: galleryCount,
        newEnquiries: enquiriesCount,
        totalClients: clientsCount,
        totalBrochures: brochuresCount,
        activeBrochure: activeBrochureData,
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

  // ---------- Helpers ----------
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
    },
    {
      label: "Brochure",
      value: overview.activeBrochure ? "Active" : "None",
      icon: FileText,
      color: overview.activeBrochure ? "text-green-600" : "text-gray-500",
      bg: overview.activeBrochure ? "bg-green-50" : "bg-gray-50",
      onClick: handleBrochureClick,
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
      actions: [
        { label: "View Products", route: "/admin/products", icon: Eye },
      ],
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
      actions: [
        { label: "View Services", route: "/admin/services", icon: Eye },
      ],
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
      key: "brochures",
      name: "Brochure",
      route: "/admin/brochures",
      icon: FileText,
      badge: overview.activeBrochure ? "Active" : "Empty",
      summary: "Manage company brochure for customer downloads.",
      stats: [
        {
          label: "Status",
          value: overview.activeBrochure ? "Uploaded" : "Not Uploaded",
        },
      ],
      extraInfo:
        "Only one brochure can be active. Upload PDF, DOC, or PPT files.",
      actions: [
        {
          label: overview.activeBrochure ? "Manage Brochure" : "Upload Brochure",
          action: () => setShowBrochureModal(true),
          icon: overview.activeBrochure ? Eye : Upload,
        },
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

      {/* Brochure Quick Card */}
      <div
        className={`rounded-xl border-2 border-dashed p-6 transition-all cursor-pointer ${
          overview.activeBrochure
            ? "bg-green-50 border-green-300 hover:border-green-400"
            : "bg-gray-50 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
        }`}
        onClick={handleBrochureClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                overview.activeBrochure ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <FileText
                className={`w-8 h-8 ${
                  overview.activeBrochure ? "text-green-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {overview.activeBrochure
                  ? overview.activeBrochure.title
                  : "No Brochure Uploaded"}
              </h3>
              {overview.activeBrochure ? (
                <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                  <span>{overview.activeBrochure.fileName}</span>
                  <span>•</span>
                  <span>{formatFileSize(overview.activeBrochure.fileSize)}</span>
                  <span>•</span>
                  <span>
                    Uploaded: {formatDate(overview.activeBrochure.createdAt)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  Click to upload a brochure for your website
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {overview.activeBrochure ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadBrochure();
                  }}
                  className="p-2 bg-white rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  Active
                </span>
              </>
            ) : (
              <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-semibold">
                Click to Upload
              </span>
            )}
          </div>
        </div>
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
              onClick={metric.onClick}
              className={`bg-white p-4 rounded-xl shadow-sm border border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all ${
                metric.onClick ? "cursor-pointer" : ""
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

      {/* Brochure Modal */}
      {showBrochureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg border ${
                    overview.activeBrochure
                      ? "bg-green-100 border-green-300"
                      : "bg-yellow-100 border-yellow-300"
                  }`}
                >
                  <FileText
                    className={`w-5 h-5 ${
                      overview.activeBrochure
                        ? "text-green-700"
                        : "text-yellow-700"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {overview.activeBrochure
                      ? "Manage Brochure"
                      : "Upload Brochure"}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {overview.activeBrochure
                      ? "View, download, replace or delete"
                      : "Upload a new brochure document"}
                  </p>
                </div>
              </div>
              <button
                onClick={resetBrochureForm}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Current Brochure Info */}
              {overview.activeBrochure && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Current Active Brochure
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-slate-600">Title:</span>{" "}
                      <span className="font-medium">
                        {overview.activeBrochure.title}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-600">File:</span>{" "}
                      <span className="font-medium">
                        {overview.activeBrochure.fileName}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-600">Size:</span>{" "}
                      <span className="font-medium">
                        {formatFileSize(overview.activeBrochure.fileSize)}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-600">Uploaded:</span>{" "}
                      <span className="font-medium">
                        {formatDate(overview.activeBrochure.createdAt)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleDownloadBrochure}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={handleDeleteBrochure}
                      disabled={deletingBrochure}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-medium disabled:opacity-50"
                    >
                      {deletingBrochure ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {deletingBrochure ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Form */}
              <div
                className={`space-y-4 ${
                  overview.activeBrochure ? "pt-4 border-t border-slate-200" : ""
                }`}
              >
                {overview.activeBrochure && (
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Replace with new brochure:
                  </p>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brochureTitle}
                    onChange={(e) => setBrochureTitle(e.target.value)}
                    placeholder="e.g., Company Brochure 2024"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={brochureDescription}
                    onChange={(e) => setBrochureDescription(e.target.value)}
                    placeholder="Brief description of the brochure..."
                    rows="2"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    File <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleBrochureFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
                      selectedBrochureFile
                        ? "border-green-400 bg-green-50"
                        : "border-slate-300 hover:border-yellow-400 hover:bg-yellow-50"
                    }`}
                  >
                    {selectedBrochureFile ? (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-900">
                          {selectedBrochureFile.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatFileSize(selectedBrochureFile.size)} • Click to
                          change
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-700">
                          Click to select file
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF, DOC, DOCX, PPT, PPTX (max 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={handleViewBrochures}
                className="text-sm font-semibold text-yellow-700 hover:text-yellow-800"
              >
                Go to Brochure Page
              </button>
              <div className="flex gap-3">
                <button
                  onClick={resetBrochureForm}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBrochureUpload}
                  disabled={
                    uploadingBrochure ||
                    !selectedBrochureFile ||
                    !brochureTitle.trim()
                  }
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                    uploadingBrochure ||
                    !selectedBrochureFile ||
                    !brochureTitle.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500 text-black border border-yellow-500"
                  }`}
                >
                  {uploadingBrochure ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {overview.activeBrochure
                        ? "Replace Brochure"
                        : "Upload Brochure"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                            if (action.action) {
                              action.action();
                              closeModuleModal();
                            } else if (action.route) {
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