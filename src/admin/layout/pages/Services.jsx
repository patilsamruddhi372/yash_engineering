import { useState, useEffect } from "react";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Star,
  DollarSign,
  Loader,
  Target,
  ClipboardCheck,
  Headphones,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react";
import { serviceAPI } from "../../../api/axios";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [editService, setEditService] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0,
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const itemsPerPage = 6;

  const [newService, setNewService] = useState({
    title: "",
    desc: "",
    category: "Repair",
    status: "Active",
    duration: "2-4 hours",
    price: "",
    features: [""],
    rating: 5.0,
    projects: 100,
    badge: "",
    featured: false,
  });

  const categoryOptions = [
    "All",
    "Repair",
    "Maintenance",
    "Installation",
    "Consultation",
    "Other",
  ];
  const statusOptions = ["All", "Active", "Inactive", "Featured", "Pending"];
  const badgeOptions = [
    "",
    "Core Service",
    "In-House",
    "Advanced",
    "Premium",
    "Popular",
  ];

  const categoryIcons = {
    Repair: Wrench,
    Maintenance: ClipboardCheck,
    Installation: Settings,
    Consultation: Headphones,
    Other: Zap,
  };

  const getServiceIcon = (category) => categoryIcons[category] || Wrench;

  // Helper to unwrap axios response or plain data
  const unwrap = (res) => (res && res.data !== undefined ? res.data : res);

  // ---------- Validation ----------
  const validateService = (service) => {
    const errors = {};

    if (!service.title || service.title.trim() === "") {
      errors.title = "Title is required";
    } else if (service.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (!service.desc || service.desc.trim() === "") {
      errors.desc = "Description is required";
    } else if (service.desc.trim().length < 10) {
      errors.desc = `Description must be at least 10 characters (currently ${service.desc.trim().length})`;
    }

    if (
      service.price === "" ||
      service.price === null ||
      service.price === undefined
    ) {
      errors.price = "Price is required";
    } else if (isNaN(service.price) || parseFloat(service.price) < 0) {
      errors.price = "Price must be a valid positive number";
    }

    if (
      service.rating &&
      (isNaN(service.rating) || service.rating < 0 || service.rating > 5)
    ) {
      errors.rating = "Rating must be between 0 and 5";
    }

    if (service.projects && (isNaN(service.projects) || service.projects < 0)) {
      errors.projects = "Projects must be a valid positive number";
    }

    if (
      ![
        "Repair",
        "Maintenance",
        "Installation",
        "Consultation",
        "Other",
      ].includes(service.category)
    ) {
      errors.category = "Category is invalid";
    }

    return errors;
  };

  // ---------- FETCH SERVICES ----------
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await serviceAPI.getServices();
      const data = unwrap(response);

      console.log("📥 Admin getServices response:", data);

      if (!data) {
        setServices([]);
        setStats({ total: 0, active: 0, inactive: 0, featured: 0 });
        return;
      }

      const servicesFromApi =
        data.data || data.services || (Array.isArray(data) ? data : []);

      setServices(servicesFromApi);

      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats({
          total: servicesFromApi.length,
          active: servicesFromApi.filter((s) => s.status === "Active").length,
          inactive: servicesFromApi.filter((s) => s.status === "Inactive")
            .length,
          featured: servicesFromApi.filter((s) => s.featured).length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ---------- Filtering & Pagination ----------
  const filteredServices = services.filter((service) => {
    const title = service.title || "";
    const desc = service.desc || "";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || service.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ---------- Helpers ----------
  const getStatusConfig = (status) => {
    const configs = {
      Active: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      },
      Inactive: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        dot: "bg-gray-400",
      },
      Featured: {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        dot: "bg-yellow-500",
      },
      Pending: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        dot: "bg-orange-500",
      },
    };
    return configs[status] || configs["Active"];
  };

  const addFeature = (isEdit = false) => {
    if (isEdit) {
      setEditService((prev) => ({
        ...prev,
        features: [...(prev.features || []), ""],
      }));
    } else {
      setNewService((prev) => ({
        ...prev,
        features: [...prev.features, ""],
      }));
    }
  };

  const removeFeature = (index, isEdit = false) => {
    if (isEdit) {
      setEditService((prev) => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index),
      }));
    } else {
      setNewService((prev) => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index),
      }));
    }
  };

  const updateFeature = (index, value, isEdit = false) => {
    if (isEdit) {
      setEditService((prev) => ({
        ...prev,
        features: prev.features.map((f, i) => (i === index ? value : f)),
      }));
    } else {
      setNewService((prev) => ({
        ...prev,
        features: prev.features.map((f, i) => (i === index ? value : f)),
      }));
    }
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setEditService({
      ...service,
      features:
        service.features && service.features.length > 0
          ? service.features
          : [""],
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const resetAddForm = () => {
    setNewService({
      title: "",
      desc: "",
      category: "Repair",
      status: "Active",
      duration: "2-4 hours",
      price: "",
      features: [""],
      rating: 5.0,
      projects: 100,
      badge: "",
      featured: false,
    });
    setFormErrors({});
  };

  // ---------- CREATE ----------
  const handleAddService = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = validateService(newService);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      const filteredFeatures = newService.features.filter(
        (f) => f && f.trim() !== ""
      );

      const serviceData = {
        title: newService.title.trim(),
        desc: newService.desc.trim(),
        category: newService.category,
        status: newService.status,
        duration: newService.duration.trim(),
        price: parseFloat(newService.price),
        features: filteredFeatures,
        rating: parseFloat(newService.rating) || 5.0,
        projects: parseInt(newService.projects) || 100,
        badge: newService.badge || "",
        featured: Boolean(newService.featured),
      };

      console.log("📤 Sending service data:", serviceData);

      const response = await serviceAPI.createService(serviceData);
      const data = unwrap(response);
      console.log("✅ Create response:", data);

      if (data?.success && data?.data) {
        setServices((prev) => [...prev, data.data]);
      }

      setShowAddModal(false);
      resetAddForm();

      setNotification({
        type: "success",
        message: `"${serviceData.title}" added successfully!`,
      });

      setTimeout(() => setNotification(null), 4000);

      fetchServices().catch((err) => console.error("Refresh error:", err));
    } catch (err) {
      console.error("❌ Error creating service:", err);
      const errorData = err.response?.data || err.data;

      if (errorData?.errors) {
        const fieldErrors = {};
        const generalErrors = [];

        if (Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error) => {
            if (typeof error === "string") {
              generalErrors.push(error);
            } else {
              const field = error.field || error.path || error.param;
              const message = error.message || error.msg;
              if (field && message) {
                fieldErrors[field] = message;
              } else if (message) {
                generalErrors.push(message);
              }
            }
          });
        } else if (typeof errorData.errors === "object") {
          Object.keys(errorData.errors).forEach((field) => {
            const errorVal = errorData.errors[field];
            if (typeof errorVal === "string") {
              fieldErrors[field] = errorVal;
            } else {
              fieldErrors[field] =
                errorVal.message || errorVal.msg || "Invalid value";
            }
          });
        }

        if (Object.keys(fieldErrors).length > 0) {
          setFormErrors(fieldErrors);
        }

        if (Object.keys(fieldErrors).length || generalErrors.length) {
          setNotification({
            type: "error",
            message: "Validation failed. Please check the form.",
          });
          setTimeout(() => setNotification(null), 4000);
          return;
        }
      }

      setNotification({
        type: "error",
        message: errorData?.message || "Failed to add service",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UPDATE ----------
  const handleUpdateService = async () => {
    if (!editService || !selectedService?._id) return;

    setEditFormErrors({});
    const errors = validateService(editService);
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      const filteredFeatures = (editService.features || []).filter(
        (f) => f && f.trim() !== ""
      );

      const serviceData = {
        title: editService.title.trim(),
        desc: editService.desc.trim(),
        category: editService.category,
        status: editService.status,
        duration: editService.duration?.trim() || "",
        price: parseFloat(editService.price),
        features: filteredFeatures,
        rating: parseFloat(editService.rating) || 5.0,
        projects: parseInt(editService.projects) || 100,
        badge: editService.badge || "",
        featured: Boolean(editService.featured),
      };

      console.log("📤 Updating service data:", serviceData);

      const response = await serviceAPI.updateService(
        selectedService._id,
        serviceData
      );
      const data = unwrap(response);
      console.log("✅ Update response:", data);

      const updated = data?.data || data;

      if (updated && updated._id) {
        setServices((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );
      } else if (data?.success) {
        await fetchServices();
      }

      setShowEditModal(false);
      setEditService(null);
      setSelectedService(null);
      setEditFormErrors({});

      setNotification({
        type: "success",
        message: `"${serviceData.title}" updated successfully!`,
      });
      setTimeout(() => setNotification(null), 4000);

      fetchServices().catch((err) => console.error("Refresh error:", err));
    } catch (err) {
      console.error("❌ Failed to update service:", err);
      const errorData = err.response?.data || err.data;

      if (errorData?.errors) {
        const backendErrors = {};

        if (Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error) => {
            if (typeof error === "string") {
              backendErrors._general =
                (backendErrors._general || "") + error + "\n";
            } else if (error.field) {
              backendErrors[error.field] =
                error.message || error.msg || "Invalid value";
            }
          });
        } else {
          Object.keys(errorData.errors).forEach((field) => {
            backendErrors[field] = errorData.errors[field];
          });
        }

        setEditFormErrors(backendErrors);
      }

      setNotification({
        type: "error",
        message: errorData?.message || "Failed to update service",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- DELETE ----------
  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedService?._id) {
      console.error("No service selected");
      return;
    }

    const serviceId = selectedService._id;
    const serviceName = selectedService.title;

    try {
      setSubmitting(true);
      console.log("🗑️ Deleting service:", serviceId);

      await serviceAPI.deleteService(serviceId);

      console.log("✅ Service deleted successfully");

      setServices((prev) => prev.filter((s) => s._id !== serviceId));

      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        active:
          selectedService.status === "Active"
            ? Math.max(0, prev.active - 1)
            : prev.active,
        inactive:
          selectedService.status === "Inactive"
            ? Math.max(0, prev.inactive - 1)
            : prev.inactive,
        featured: selectedService.featured
          ? Math.max(0, prev.featured - 1)
          : prev.featured,
      }));

      setShowDeleteModal(false);
      setSelectedService(null);

      setNotification({
        type: "success",
        message: `"${serviceName}" deleted successfully!`,
      });

      setTimeout(() => setNotification(null), 4000);

      fetchServices().catch((err) => console.error("Refresh error:", err));
    } catch (err) {
      console.error("Delete error:", err);

      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to delete service",
      });

      setTimeout(() => setNotification(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (service) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    if (isEdit) {
      setEditService((prev) => ({ ...prev, [name]: finalValue }));
      if (editFormErrors[name]) {
        setEditFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setNewService((prev) => ({ ...prev, [name]: finalValue }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const statsDisplay = [
    {
      label: "Total Services",
      value: stats.total || services.length,
      icon: Wrench,
    },
    {
      label: "Active",
      value:
        stats.active || services.filter((s) => s.status === "Active").length,
      icon: CheckCircle,
    },
    {
      label: "Featured",
      value: stats.featured || services.filter((s) => s.featured).length,
      icon: Star,
    },
    {
      label: "Categories",
      value: new Set(services.map((s) => s.category)).size,
      icon: Target,
    },
  ];

  // ---------- Loading / Error ----------
  if (loading && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">
            Error Loading Services
          </p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchServices}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ---------- JSX (UI) ----------
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border min-w-[320px] ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {notification.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg">
              <Wrench className="w-6 h-6 text-black" />
            </div>
            Services
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your service offerings • {stats.total || services.length}{" "}
            total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-yellow-400 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Icon className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white cursor-pointer min-w-[160px]"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white cursor-pointer min-w-[140px]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-yellow-400 shadow-sm text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-yellow-400 shadow-sm text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm ||
          selectedCategory !== "All" ||
          selectedStatus !== "All") && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm border border-yellow-200">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-yellow-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm border border-yellow-200">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="hover:text-yellow-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedStatus !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm border border-yellow-200">
                {selectedStatus}
                <button
                  onClick={() => setSelectedStatus("All")}
                  className="hover:text-yellow-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedStatus("All");
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-gray-700">
            {filteredServices.length > 0 ? startIndex + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-700">
            {Math.min(startIndex + itemsPerPage, filteredServices.length)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700">
            {filteredServices.length}
          </span>{" "}
          services
        </p>
        <button
          onClick={fetchServices}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedServices.length > 0 ? (
            paginatedServices.map((service) => {
              const IconComponent = getServiceIcon(service.category);
              const status = service.status || "Active";
              const statusConfig = getStatusConfig(status);

              return (
                <div
                  key={service._id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-yellow-400 transition-all"
                >
                  {/* Card Header */}
                  <div className="relative h-40 bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                    <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center shadow-sm">
                      <IconComponent className="w-8 h-8 text-black" />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                        ></span>
                        {status}
                      </span>
                    </div>

                    {/* Badge */}
                    {service.badge && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-black text-yellow-400 text-xs font-medium rounded-full">
                          {service.badge}
                        </span>
                      </div>
                    )}

                    {/* Featured */}
                    {service.featured && (
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400 text-black rounded-full text-xs font-semibold">
                          <Star className="w-3 h-3 fill-black" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mb-3">
                      <IconComponent className="w-3 h-3" />
                      {service.category}
                    </span>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-1">
                      {service.title}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
                      {service.desc}
                    </p>

                    {/* Features Preview */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-1.5 mb-4">
                        {service.features.slice(0, 2).map((feature, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 line-clamp-1">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {service.features.length > 2 && (
                          <p className="text-xs text-gray-400 pl-6">
                            +{service.features.length - 2} more features
                          </p>
                        )}
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-gray-700">
                          {service.rating?.toFixed
                            ? service.rating.toFixed(1)
                            : "5.0"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">
                          {service.projects || "100"}
                        </span>{" "}
                        projects
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-900 ml-auto">
                        <DollarSign className="h-4 w-4" />
                        {service.price || "0"}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleView(service)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditClick(service)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-black bg-yellow-400 hover:bg-yellow-500 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
                    <Wrench className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No services found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedStatus("All");
                    }}
                    className="text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-yellow-400">
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Service
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedServices.length > 0 ? (
                  paginatedServices.map((service) => {
                    const IconComponent = getServiceIcon(service.category);
                    const status = service.status || "Active";
                    const statusConfig = getStatusConfig(status);

                    return (
                      <tr
                        key={service._id}
                        className="hover:bg-yellow-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-yellow-200">
                              <IconComponent className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {service.title}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {service.desc}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <IconComponent className="w-3 h-3" />
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                            ></span>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {service.rating?.toFixed
                                ? service.rating.toFixed(1)
                                : "5.0"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-semibold">
                            ${service.price || "0"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleView(service)}
                              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(service)}
                              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(service)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4 border border-yellow-200">
                          <Wrench className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          No services found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Try adjusting your search or filter criteria
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All");
                            setSelectedStatus("All");
                          }}
                          className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredServices.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-700">{currentPage}</span> of{" "}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 text-sm rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-yellow-400 text-black"
                        : "text-gray-600 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">
                  Add New Service
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Create a new service offering
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Title & Category */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newService.title}
                      onChange={(e) => handleInputChange(e, false)}
                      placeholder="Enter service title"
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all ${
                        formErrors.title
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-yellow-400"
                      }`}
                      disabled={submitting}
                    />
                    {formErrors.title && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={newService.category}
                      onChange={(e) => handleInputChange(e, false)}
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all appearance-none bg-white ${
                        formErrors.category
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-yellow-400"
                      }`}
                      disabled={submitting}
                    >
                      {categoryOptions
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                    {formErrors.category && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2">
                      (min 10 characters)
                    </span>
                  </label>
                  <textarea
                    name="desc"
                    value={newService.desc}
                    onChange={(e) => handleInputChange(e, false)}
                    placeholder="Enter service description"
                    rows="4"
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all resize-none ${
                      formErrors.desc
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-yellow-400"
                    }`}
                    disabled={submitting}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    {formErrors.desc ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.desc}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span
                      className={`text-sm ${
                        newService.desc.length < 10
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {newService.desc.length}/10
                      {newService.desc.length >= 10 && (
                        <CheckCircle className="w-4 h-4 inline ml-1" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features
                  </label>
                  <div className="space-y-2">
                    {newService.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            updateFeature(index, e.target.value, false)
                          }
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                          disabled={submitting}
                        />
                        {newService.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index, false)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={submitting}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addFeature(false)}
                    className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                    disabled={submitting}
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>

                {/* Status, Duration, Price */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newService.status}
                      onChange={(e) => handleInputChange(e, false)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                      disabled={submitting}
                    >
                      {statusOptions
                        .filter((s) => s !== "All")
                        .map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={newService.duration}
                      onChange={(e) => handleInputChange(e, false)}
                      placeholder="e.g., 2-4 hours"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newService.price}
                      onChange={(e) => handleInputChange(e, false)}
                      placeholder="0.00"
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all ${
                        formErrors.price
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-yellow-400"
                      }`}
                      disabled={submitting}
                    />
                    {formErrors.price && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {formErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating, Projects, Badge */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={newService.rating}
                      onChange={(e) => handleInputChange(e, false)}
                      placeholder="5.0"
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projects Count
                    </label>
                    <input
                      type="number"
                      name="projects"
                      value={newService.projects}
                      onChange={(e) => handleInputChange(e, false)}
                      placeholder="100"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge
                    </label>
                    <select
                      name="badge"
                      value={newService.badge}
                      onChange={(e) => handleInputChange(e, false)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                      disabled={submitting}
                    >
                      {badgeOptions.map((badge) => (
                        <option key={badge} value={badge}>
                          {badge || "None"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={newService.featured}
                    onChange={(e) => handleInputChange(e, false)}
                    className="w-5 h-5 text-yellow-500 rounded border-gray-300 focus:ring-2 focus:ring-yellow-400"
                    disabled={submitting}
                  />
                  <label
                    htmlFor="featured"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    <Star className="w-5 h-5 text-yellow-500" />
                    Mark as Featured Service
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SERVICE MODAL */}
      {showEditModal && editService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-900">
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">
                  Edit Service
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Update service details
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditService(null);
                  setEditFormErrors({});
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                disabled={submitting}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Title & Category */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={editService.title}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="Enter service title"
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all ${
                        editFormErrors.title
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-yellow-400"
                      }`}
                      disabled={submitting}
                    />
                    {editFormErrors.title && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editFormErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={editService.category}
                      onChange={(e) => handleInputChange(e, true)}
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all appearance-none bg-white ${
                        editFormErrors.category
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-yellow-400"
                      }`}
                      disabled={submitting}
                    >
                      {categoryOptions
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                    {editFormErrors.category && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editFormErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2">
                      (min 10 characters)
                    </span>
                  </label>
                  <textarea
                    name="desc"
                    value={editService.desc}
                    onChange={(e) => handleInputChange(e, true)}
                    placeholder="Enter service description"
                    rows="4"
                    className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all resize-none ${
                      editFormErrors.desc
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-yellow-400"
                    }`}
                    disabled={submitting}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    {editFormErrors.desc ? (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editFormErrors.desc}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span
                      className={`text-sm ${
                        editService.desc.length < 10
                          ? "text-orange-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {editService.desc.length}/10
                      {editService.desc.length >= 10 && (
                        <CheckCircle className="w-4 h-4 inline ml-1" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features
                  </label>
                  <div className="space-y-2">
                    {editService.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            updateFeature(index, e.target.value, true)
                          }
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                          disabled={submitting}
                        />
                        {editService.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index, true)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={submitting}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addFeature(true)}
                    className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                    disabled={submitting}
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>

                {/* Status, Duration, Price */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editService.status}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                      disabled={submitting}
                    >
                      {statusOptions
                        .filter((s) => s !== "All")
                        .map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={editService.duration}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="e.g., 2-4 hours"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={editService.price}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="0.00"
                      className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all ${
                        editFormErrors.price
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-300 focus:border-yellow-400"
                      }`}
                      disabled={submitting}
                    />
                    {editFormErrors.price && (
                      <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {editFormErrors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating, Projects, Badge */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      value={editService.rating}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="5.0"
                      step="0.1"
                      min="0"
                      max="5"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projects Count
                    </label>
                    <input
                      type="number"
                      name="projects"
                      value={editService.projects}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="100"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge
                    </label>
                    <select
                      name="badge"
                      value={editService.badge}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none bg-white"
                      disabled={submitting}
                    >
                      {badgeOptions.map((badge) => (
                        <option key={badge} value={badge}>
                          {badge || "None"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured-edit"
                    checked={editService.featured}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-5 h-5 text-yellow-500 rounded border-gray-300 focus:ring-2 focus:ring-yellow-400"
                    disabled={submitting}
                  />
                  <label
                    htmlFor="featured-edit"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    <Star className="w-5 h-5 text-yellow-500" />
                    Mark as Featured Service
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditService(null);
                  setEditFormErrors({});
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateService}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW SERVICE DETAIL MODAL */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-yellow-400">
            {/* Modal Header with Icon */}
            <div className="relative h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
              {(() => {
                const Icon = getServiceIcon(selectedService.category);
                return (
                  <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon className="w-10 h-10 text-black" />
                  </div>
                );
              })()}
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white backdrop-blur rounded-lg transition-colors shadow-sm"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(90vh-280px)] overflow-y-auto">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {(() => {
                  const Icon = getServiceIcon(selectedService.category);
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      <Icon className="w-3 h-3" />
                      {selectedService.category}
                    </span>
                  );
                })()}
                {selectedService.badge && (
                  <span className="px-2.5 py-1 bg-black text-yellow-400 text-xs font-medium rounded-full">
                    {selectedService.badge}
                  </span>
                )}
                {selectedService.featured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400 text-black rounded-full text-xs font-semibold">
                    <Star className="w-3 h-3 fill-black" />
                    Featured
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {selectedService.title}
              </h3>

              {/* Status */}
              {(() => {
                const statusConfig = getStatusConfig(
                  selectedService.status || "Active"
                );
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                    ></span>
                    {selectedService.status || "Active"}
                  </span>
                );
              })()}

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                  {selectedService.desc}
                </p>
              </div>

              {/* Features */}
              {selectedService.features &&
                selectedService.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Key Features
                    </h4>
                    <div className="space-y-2">
                      {selectedService.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium uppercase">
                      Duration
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedService.duration || "N/A"}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium uppercase">Price</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    ${selectedService.price || "0"}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium uppercase">
                      Rating
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedService.rating?.toFixed
                      ? selectedService.rating.toFixed(1)
                      : "5.0"}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Target className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-medium uppercase">
                      Projects
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedService.projects || "100"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditClick(selectedService);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border-2 border-red-400">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto mb-5">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Delete Service
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                "{selectedService.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}