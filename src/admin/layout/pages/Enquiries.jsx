// client/src/pages/admin/Enquiries.jsx
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Star,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Inbox,
  Archive,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  StarOff,
  MessageSquare,
  Building,
  Calendar,
  TrendingUp,
  Users,
  X,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useEnquiries } from "../hooks/useEnquiries";
import EnquiryModal from "../EnquiryModel";
import { toast } from "react-hot-toast";

// ============================================
// STATUS CONFIGURATION (Light Yellow + Black Theme)
// ============================================
const STATUS_CONFIG = {
  new: { 
    label: "New", 
    color: "bg-yellow-100 text-black border border-yellow-300", 
    icon: Inbox 
  },
  "in-progress": { 
    label: "In Progress", 
    color: "bg-yellow-200 text-black border border-yellow-400", 
    icon: Clock 
  },
  responded: { 
    label: "Responded", 
    color: "bg-yellow-50 text-black border border-yellow-200", 
    icon: MessageSquare 
  },
  converted: { 
    label: "Converted", 
    color: "bg-yellow-300 text-black border border-yellow-500", 
    icon: CheckCircle 
  },
  closed: { 
    label: "Closed", 
    color: "bg-black/5 text-black/70 border border-black/10", 
    icon: XCircle 
  },
  spam: { 
    label: "Spam", 
    color: "bg-red-100 text-red-800 border border-red-300", 
    icon: AlertCircle 
  },
};

// ============================================
// PRIORITY CONFIGURATION (Light Yellow + Black Theme)
// ============================================
const PRIORITY_CONFIG = {
  low: { 
    label: "Low", 
    color: "bg-black/5 text-black/70 border border-black/10" 
  },
  medium: { 
    label: "Medium", 
    color: "bg-yellow-100 text-black border border-yellow-300" 
  },
  high: { 
    label: "High", 
    color: "bg-yellow-200 text-black border border-yellow-400" 
  },
  urgent: { 
    label: "Urgent", 
    color: "bg-red-100 text-red-700 border border-red-300" 
  },
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function Enquiries() {
  // Hook
  const {
    enquiries,
    loading,
    error,
    stats,
    selectedEnquiry,
    selectedIds,
    pagination,
    filters,
    isAllSelected,
    hasSelection,
    unreadCount,
    getEnquiry,
    updateEnquiry,
    deleteEnquiry,
    updateStatus,
    markAsRead,
    toggleStar,
    archiveEnquiry,
    toggleSelect,
    selectAll,
    clearSelection,
    setSelectedEnquiry,
    updateFilters,
    resetFilters,
    goToPage,
    refresh,
    exportEnquiries,
    bulkMarkAsRead,
    bulkArchive,
    bulkUpdateStatus,
    bulkDelete,
  } = useEnquiries();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('single'); // 'single' or 'bulk'
  const [isDeleting, setIsDeleting] = useState(false);

  // ==================== SEARCH HANDLER ====================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilters({ search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, updateFilters]);

  // ==================== ENQUIRY MODAL HANDLERS ====================
  
  /**
   * Open enquiry details modal
   */
  const handleOpenEnquiry = async (enquiry) => {
    setIsModalOpen(true);
    setModalLoading(true);
    try {
      await getEnquiry(enquiry._id);
      if (!enquiry.isRead) {
        await markAsRead(enquiry._id);
      }
    } catch (error) {
      console.error("Error opening enquiry:", error);
      toast.error("Failed to load enquiry details");
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * Close enquiry modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  // ==================== DELETE HANDLERS ====================
  
  /**
   * Show delete confirmation for single enquiry
   */
  const handleDeleteClick = (enquiry, e) => {
    if (e) e.stopPropagation();
    setDeleteTarget(enquiry);
    setDeleteType('single');
    setShowDeleteConfirm(true);
  };

  /**
   * Show delete confirmation for bulk delete
   */
  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      toast.error('No enquiries selected');
      return;
    }
    setDeleteTarget(selectedIds);
    setDeleteType('bulk');
    setShowDeleteConfirm(true);
  };

  /**
   * Confirm and execute delete
   */
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteType === 'single') {
        await deleteEnquiry(deleteTarget._id);
        toast.success('Enquiry deleted successfully');
        if (isModalOpen) {
          handleCloseModal();
        }
      } else {
        await bulkDelete();
        toast.success(`${deleteTarget.length} enquir${deleteTarget.length > 1 ? 'ies' : 'y'} deleted successfully`);
        clearSelection();
      }
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete enquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Cancel delete
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    setDeleteType('single');
    setIsDeleting(false);
  };

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Format date to relative time
   */
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
    });
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  /**
   * Get priority badge
   */
  const getPriorityBadge = (priority) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 text-black">
      
      {/* ==================== HEADER ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Enquiries</h1>
          <p className="text-black/70 mt-1">
            Manage customer enquiries and leads
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-black rounded-full text-sm font-medium border border-yellow-300">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-black border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => exportEnquiries("csv")}
            className="flex items-center gap-2 px-4 py-2 bg-black text-yellow-50 rounded-lg hover:bg-gray-900 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Inbox className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-black">{stats.total || 0}</span>
            </div>
            <p className="text-sm text-black/70 mt-1">Total</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Mail className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-black">{stats.unread || 0}</span>
            </div>
            <p className="text-sm text-black/70 mt-1">Unread</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-black">
                {stats.byStatus?.["in-progress"] || 0}
              </span>
            </div>
            <p className="text-sm text-black/70 mt-1">In Progress</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-black">
                {stats.byStatus?.converted || 0}
              </span>
            </div>
            <p className="text-sm text-black/70 mt-1">Converted</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-black">{stats.today || 0}</span>
            </div>
            <p className="text-sm text-black/70 mt-1">Today</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-black">{stats.thisWeek || 0}</span>
            </div>
            <p className="text-sm text-black/70 mt-1">This Week</p>
          </div>
        </div>
      )}

      {/* ==================== SEARCH & FILTERS ==================== */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-black placeholder:text-black/40"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
                showFilters
                  ? "bg-yellow-100 border-yellow-500 text-black"
                  : "bg-yellow-50 border-yellow-300 text-black/80 hover:bg-yellow-100"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.status || filters.priority || filters.source || filters.isRead) && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              )}
            </button>

            {(filters.status || filters.priority || filters.source || filters.search || filters.isRead) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2.5 text-black/70 hover:text-black"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-yellow-200 grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Status</label>
              <select
                value={filters.status || ""}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-black"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Priority</label>
              <select
                value={filters.priority || ""}
                onChange={(e) => updateFilters({ priority: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-black"
              >
                <option value="">All Priority</option>
                {Object.entries(PRIORITY_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Read Status</label>
              <select
                value={filters.isRead || ""}
                onChange={(e) => updateFilters({ isRead: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-black"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Source</label>
              <select
                value={filters.source || ""}
                onChange={(e) => updateFilters({ source: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-black"
              >
                <option value="">All Sources</option>
                <option value="Contact Form">Contact Form</option>
                <option value="Product Inquiry">Product Inquiry</option>
                <option value="Quote Request">Quote Request</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ==================== BULK ACTIONS ==================== */}
      {hasSelection && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-medium text-black">
            {selectedIds.length} enquir{selectedIds.length > 1 ? "ies" : "y"} selected
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={bulkMarkAsRead}
              className="px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-black hover:bg-yellow-200 flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Mark as Read
            </button>
            <button
              onClick={() => bulkUpdateStatus("in-progress")}
              className="px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-black hover:bg-yellow-200 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" />
              In Progress
            </button>
            <button
              onClick={bulkArchive}
              className="px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-black hover:bg-yellow-200 flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
            <button
              onClick={handleBulkDeleteClick}
              className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 hover:bg-red-100 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-black/70 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ==================== ENQUIRIES TABLE ==================== */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden shadow-sm">
        {loading && enquiries.length === 0 ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mb-4" />
            <p className="text-black/60">Loading enquiries...</p>
          </div>
        ) : enquiries.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <Inbox className="w-16 h-16 mx-auto text-black/20 mb-4" />
            <h3 className="text-lg font-medium text-black mb-1">No enquiries found</h3>
            <p className="text-black/70">
              {filters.search || filters.status || filters.priority
                ? "Try adjusting your filters"
                : "Enquiries will appear here when customers submit them"}
            </p>
            {(filters.search || filters.status || filters.priority || filters.source) && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-yellow-100 text-black border border-yellow-300 rounded-lg hover:bg-yellow-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          // Table
          <div className="overflow-x-auto">
            <table className="w-full">
              
              {/* Table Header */}
              <thead className="bg-yellow-100/70 border-b border-yellow-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={selectAll}
                      className="rounded border-yellow-400 text-yellow-500 focus:ring-yellow-400"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black/70 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-yellow-100">
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry._id}
                    className={`hover:bg-yellow-100/70 transition-colors cursor-pointer ${
                      !enquiry.isRead ? "bg-yellow-50/50" : ""
                    }`}
                    onClick={() => handleOpenEnquiry(enquiry)}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(enquiry._id)}
                        onChange={() => toggleSelect(enquiry._id)}
                        className="rounded border-yellow-400 text-yellow-500 focus:ring-yellow-400"
                      />
                    </td>

                    {/* Contact Info */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(enquiry._id);
                          }}
                          className={`flex-shrink-0 transition-colors ${
                            enquiry.isStarred
                              ? "text-yellow-500"
                              : "text-black/30 hover:text-yellow-500"
                          }`}
                        >
                          {enquiry.isStarred ? (
                            <Star className="w-5 h-5 fill-current" />
                          ) : (
                            <StarOff className="w-5 h-5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium text-black truncate ${
                                !enquiry.isRead ? "font-semibold" : ""
                              }`}
                            >
                              {enquiry.name}
                            </span>
                            {!enquiry.isRead && (
                              <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-black/60">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{enquiry.email}</span>
                          </div>
                          {enquiry.phone && (
                            <div className="flex items-center gap-2 text-sm text-black/60">
                              <Phone className="w-3 h-3" />
                              <span>{enquiry.phone}</span>
                            </div>
                          )}
                          {enquiry.company && (
                            <div className="flex items-center gap-1 text-xs text-black/50 mt-0.5">
                              <Building className="w-3 h-3" />
                              <span className="truncate">{enquiry.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Subject & Message Preview */}
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p
                          className={`truncate ${
                            !enquiry.isRead
                              ? "font-medium text-black"
                              : "text-black"
                          }`}
                        >
                          {enquiry.subject || "No subject"}
                        </p>
                        <p className="text-sm text-black/60 truncate mt-0.5">
                          {enquiry.message?.substring(0, 60)}
                          {enquiry.message?.length > 60 ? "..." : ""}
                        </p>
                        {enquiry.source && (
                          <span className="inline-block mt-1 text-xs text-black/50">
                            via {enquiry.source}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {getStatusBadge(enquiry.status)}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      {getPriorityBadge(enquiry.priority)}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-black/80">
                          {formatDate(enquiry.createdAt)}
                        </span>
                        {enquiry.respondedAt && (
                          <span className="text-xs text-green-600">
                            Responded
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEnquiry(enquiry)}
                          className="p-2 text-black/40 hover:text-black hover:bg-yellow-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {enquiry.phone && (
                          <a
                            href={`https://wa.me/${enquiry.phone?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-black/40 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => archiveEnquiry(enquiry._id)}
                          className="p-2 text-black/40 hover:text-black hover:bg-yellow-100 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(enquiry, e)}
                          className="p-2 text-black/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== PAGINATION ==================== */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-yellow-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-yellow-50">
            <p className="text-sm text-black/70">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} enquiries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-yellow-200 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? "bg-black text-yellow-50"
                          : "hover:bg-yellow-100 text-black/70"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-yellow-200 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-yellow-200 animate-scaleIn">
            
            {/* Warning Icon */}
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-black text-center mb-2">
              Confirm Delete
            </h3>

            {/* Message */}
            <p className="text-black/70 text-center mb-6 leading-relaxed">
              {deleteType === 'single' ? (
                <>
                  Are you sure you want to delete the enquiry from{" "}
                  <span className="font-semibold text-black">{deleteTarget?.name}</span>?
                  <br />
                  <span className="text-sm text-red-600">This action cannot be undone.</span>
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-black">{deleteTarget?.length}</span>{" "}
                  enquir{deleteTarget?.length > 1 ? 'ies' : 'y'}?
                  <br />
                  <span className="text-sm text-red-600">This action cannot be undone.</span>
                </>
              )}
            </p>

            {/* Enquiry Details (for single delete) */}
            {deleteType === 'single' && deleteTarget && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-black/40 flex-shrink-0" />
                    <span className="text-black/70 truncate">{deleteTarget.email}</span>
                  </div>
                  {deleteTarget.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-black/40 flex-shrink-0" />
                      <span className="text-black/70">{deleteTarget.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-black/40 flex-shrink-0" />
                    <span className="text-black/70 truncate">
                      {deleteTarget.subject || "No subject"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-yellow-100 text-black border border-yellow-300 rounded-lg font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete {deleteType === 'bulk' ? 'All' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ENQUIRY DETAILS MODAL ==================== */}
      <EnquiryModal
        enquiry={selectedEnquiry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={updateEnquiry}
        onDelete={handleDeleteClick}
        onToggleStar={toggleStar}
        onArchive={archiveEnquiry}
        loading={modalLoading}
      />

      {/* ==================== CUSTOM ANIMATIONS ==================== */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}