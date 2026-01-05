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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useEnquiries } from "../hooks/useEnquiries";
import EnquiryModal from "../EnquiryModel";
import { toast } from "react-hot-toast";

// Status configuration (light yellow + black theme)
const STATUS_CONFIG = {
  new: { label: "New", color: "bg-yellow-100 text-black", icon: Inbox },
  "in-progress": { label: "In Progress", color: "bg-yellow-200 text-black", icon: Clock },
  responded: { label: "Responded", color: "bg-yellow-50 text-black", icon: MessageSquare },
  converted: { label: "Converted", color: "bg-yellow-300 text-black", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-black/5 text-black/70", icon: XCircle },
  spam: { label: "Spam", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

// Priority configuration (light yellow + black theme)
const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-black/5 text-black/70" },
  medium: { label: "Medium", color: "bg-yellow-100 text-black" },
  high: { label: "High", color: "bg-yellow-200 text-black" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export default function Enquiries() {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilters({ search: searchTerm });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Open enquiry modal
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
    } finally {
      setModalLoading(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  // Format date
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
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <config.icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Enquiries</h1>
          <p className="text-black/70 mt-1">
            Manage customer enquiries and leads
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-black rounded-full text-sm font-medium">
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

      {/* Search & Filters */}
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
              className="w-full pl-10 pr-4 py-2.5 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
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
              {(filters.status || filters.priority || filters.source) && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              )}
            </button>

            {(filters.status || filters.priority || filters.source || filters.search) && (
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
            <div>
              <label className="block text-sm font-medium text-black mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => updateFilters({ priority: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">All Priority</option>
                {Object.entries(PRIORITY_CONFIG).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Read Status</label>
              <select
                value={filters.isRead}
                onChange={(e) => updateFilters({ isRead: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => updateFilters({ source: e.target.value })}
                className="w-full px-3 py-2 border border-yellow-200 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              >
                <option value="">All Sources</option>
                <option value="Contact Form">Contact Form</option>
                <option value="Product Inquiry">Product Inquiry</option>
                <option value="Quote Request">Quote Request</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <span className="font-medium text-black">
            {selectedIds.length} enquir{selectedIds.length > 1 ? "ies" : "y"} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={bulkMarkAsRead}
              className="px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-black hover:bg-yellow-200"
            >
              Mark as Read
            </button>
            <button
              onClick={() => bulkUpdateStatus("in-progress")}
              className="px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-black hover:bg-yellow-200"
            >
              Set In Progress
            </button>
            <button
              onClick={bulkArchive}
              className="px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm text-black hover:bg-yellow-200"
            >
              Archive
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

      {/* Enquiries Table */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden shadow-sm">
        {loading && enquiries.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : enquiries.length === 0 ? (
          <div className="text-center py-20">
            <Inbox className="w-16 h-16 mx-auto text-black/20 mb-4" />
            <h3 className="text-lg font-medium text-black mb-1">No enquiries found</h3>
            <p className="text-black/70">
              {filters.search || filters.status || filters.priority
                ? "Try adjusting your filters"
                : "Enquiries will appear here when customers submit them"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
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
              <tbody className="divide-y divide-yellow-100">
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry._id}
                    className={`hover:bg-yellow-100/70 transition-colors cursor-pointer ${
                      !enquiry.isRead ? "bg-yellow-50" : ""
                    }`}
                    onClick={() => handleOpenEnquiry(enquiry)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(enquiry._id)}
                        onChange={() => toggleSelect(enquiry._id)}
                        className="rounded border-yellow-400 text-yellow-500 focus:ring-yellow-400"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(enquiry._id);
                          }}
                          className={`flex-shrink-0 ${
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
                              className={`font-medium text-black ${
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
                            <span className="truncate max-w-[150px]">{enquiry.email}</span>
                          </div>
                          {enquiry.company && (
                            <div className="flex items-center gap-1 text-xs text-black/50 mt-0.5">
                              <Building className="w-3 h-3" />
                              {enquiry.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p
                          className={`truncate ${
                            !enquiry.isRead
                              ? "font-medium text-black"
                              : "text-black"
                          }`}
                        >
                          {enquiry.subject}
                        </p>
                        <p className="text-sm text-black/60 truncate mt-0.5">
                          {enquiry.message?.substring(0, 60)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(enquiry.status)}</td>
                    <td className="px-4 py-4">{getPriorityBadge(enquiry.priority)}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-black/60">
                        {formatDate(enquiry.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEnquiry(enquiry)}
                          className="p-2 text-black/40 hover:text-black hover:bg-yellow-100 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${enquiry.phone?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-black/40 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => archiveEnquiry(enquiry._id)}
                          className="p-2 text-black/40 hover:text-black hover:bg-yellow-100 rounded-lg"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-yellow-200 flex items-center justify-between bg-yellow-50">
            <p className="text-sm text-black/70">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-yellow-200 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
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
                className="p-2 border border-yellow-200 rounded-lg hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        enquiry={selectedEnquiry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={updateEnquiry}
        onDelete={deleteEnquiry}
        onToggleStar={toggleStar}
        onArchive={archiveEnquiry}
        loading={modalLoading}
      />
    </div>
  );
}