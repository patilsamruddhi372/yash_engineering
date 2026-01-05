import { useState, useEffect, useCallback, useMemo } from 'react';
import { enquiryAPI } from '../../../api/axios';
import { toast } from 'react-hot-toast';

export const useEnquiries = (initialFilters = {}) => {
  // State
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: '',
    search: '',
    startDate: '',
    endDate: '',
    isRead: '',
    isStarred: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  // ============================================
  // Fetch Enquiries
  // ============================================

  const fetchEnquiries = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...customFilters,
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await enquiryAPI.getEnquiries(params);

      if (response.success) {
        setEnquiries(response.data || []);
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError(err.message || 'Failed to fetch enquiries');
      toast.error(err.message || 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // ============================================
  // Fetch Stats
  // ============================================

  const fetchStats = useCallback(async () => {
    try {
      const response = await enquiryAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // ============================================
  // Single Enquiry Operations
  // ============================================

  const getEnquiry = useCallback(async (id) => {
    try {
      const response = await enquiryAPI.getEnquiry(id);
      if (response.success) {
        setSelectedEnquiry(response.data);
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch enquiry');
      throw err;
    }
  }, []);

  const updateEnquiry = useCallback(async (id, data) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, data);
      if (response.success) {
        // Update local state
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? { ...enq, ...response.data } : enq))
        );
        if (selectedEnquiry?._id === id) {
          setSelectedEnquiry(prev => ({ ...prev, ...response.data }));
        }
        toast.success('Enquiry updated successfully');
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update enquiry');
      throw err;
    }
  }, [selectedEnquiry]);

  const deleteEnquiry = useCallback(async (id) => {
    try {
      const response = await enquiryAPI.deleteEnquiry(id);
      if (response.success) {
        setEnquiries(prev => prev.filter(enq => enq._id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        if (selectedEnquiry?._id === id) {
          setSelectedEnquiry(null);
        }
        toast.success('Enquiry deleted successfully');
        fetchStats(); // Refresh stats
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete enquiry');
      throw err;
    }
  }, [selectedEnquiry, fetchStats]);

  // ============================================
  // Status & Priority
  // ============================================

  const updateStatus = useCallback(async (id, status) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { status });
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? { ...enq, status } : enq))
        );
        toast.success(`Status updated to ${status}`);
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
      throw err;
    }
  }, [fetchStats]);

  const updatePriority = useCallback(async (id, priority) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { priority });
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? { ...enq, priority } : enq))
        );
        toast.success(`Priority updated to ${priority}`);
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update priority');
      throw err;
    }
  }, []);

  // ============================================
  // Read & Star
  // ============================================

  const markAsRead = useCallback(async (id) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { isRead: true });
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? { ...enq, isRead: true } : enq))
        );
        fetchStats();
        return response.data;
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, [fetchStats]);

  const markAsUnread = useCallback(async (id) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { isRead: false });
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? { ...enq, isRead: false } : enq))
        );
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark as unread');
    }
  }, [fetchStats]);

  const toggleStar = useCallback(async (id) => {
    const enquiry = enquiries.find(e => e._id === id);
    const newStarred = !enquiry?.isStarred;

    try {
      const response = await enquiryAPI.updateEnquiry(id, { isStarred: newStarred });
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? { ...enq, isStarred: newStarred } : enq))
        );
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update star');
    }
  }, [enquiries]);

  const archiveEnquiry = useCallback(async (id) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { isArchived: true });
      if (response.success) {
        setEnquiries(prev => prev.filter(enq => enq._id !== id));
        toast.success('Enquiry archived');
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to archive enquiry');
    }
  }, [fetchStats]);

  // ============================================
  // Notes & Responses
  // ============================================

  const addNote = useCallback(async (id, content) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { note: content });
      if (response.success) {
        if (selectedEnquiry?._id === id) {
          setSelectedEnquiry(response.data);
        }
        toast.success('Note added successfully');
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add note');
      throw err;
    }
  }, [selectedEnquiry]);

  const addResponse = useCallback(async (id, responseData) => {
    try {
      const response = await enquiryAPI.updateEnquiry(id, { response: responseData });
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq => (enq._id === id ? response.data : enq))
        );
        if (selectedEnquiry?._id === id) {
          setSelectedEnquiry(response.data);
        }
        toast.success('Response recorded');
        fetchStats();
        return response.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add response');
      throw err;
    }
  }, [selectedEnquiry, fetchStats]);

  // ============================================
  // Bulk Operations
  // ============================================

  const bulkMarkAsRead = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.error('No enquiries selected');
      return;
    }

    try {
      const response = await enquiryAPI.bulkUpdate(selectedIds, 'markRead');
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq =>
            selectedIds.includes(enq._id) ? { ...enq, isRead: true } : enq
          )
        );
        setSelectedIds([]);
        toast.success(`${response.modifiedCount || selectedIds.length} enquiries marked as read`);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark as read');
    }
  }, [selectedIds, fetchStats]);

  const bulkMarkAsUnread = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.error('No enquiries selected');
      return;
    }

    try {
      const response = await enquiryAPI.bulkUpdate(selectedIds, 'markUnread');
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq =>
            selectedIds.includes(enq._id) ? { ...enq, isRead: false } : enq
          )
        );
        setSelectedIds([]);
        toast.success(`${response.modifiedCount || selectedIds.length} enquiries marked as unread`);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark as unread');
    }
  }, [selectedIds, fetchStats]);

  const bulkArchive = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.error('No enquiries selected');
      return;
    }

    try {
      const response = await enquiryAPI.bulkUpdate(selectedIds, 'archive');
      if (response.success) {
        setEnquiries(prev => prev.filter(enq => !selectedIds.includes(enq._id)));
        setSelectedIds([]);
        toast.success(`${response.modifiedCount || selectedIds.length} enquiries archived`);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to archive');
    }
  }, [selectedIds, fetchStats]);

  const bulkUpdateStatus = useCallback(async (status) => {
    if (selectedIds.length === 0) {
      toast.error('No enquiries selected');
      return;
    }

    try {
      const response = await enquiryAPI.bulkUpdate(selectedIds, 'updateStatus', status);
      if (response.success) {
        setEnquiries(prev =>
          prev.map(enq =>
            selectedIds.includes(enq._id) ? { ...enq, status } : enq
          )
        );
        setSelectedIds([]);
        toast.success(`${response.modifiedCount || selectedIds.length} enquiries updated`);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  }, [selectedIds, fetchStats]);

  const bulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.error('No enquiries selected');
      return;
    }

    try {
      const response = await enquiryAPI.bulkUpdate(selectedIds, 'delete');
      if (response.success) {
        setEnquiries(prev => prev.filter(enq => !selectedIds.includes(enq._id)));
        setSelectedIds([]);
        toast.success(`${selectedIds.length} enquiries deleted`);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  }, [selectedIds, fetchStats]);

  // ============================================
  // Selection Management
  // ============================================

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.length === enquiries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enquiries.map(e => e._id));
    }
  }, [enquiries, selectedIds.length]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // ============================================
  // Filter & Pagination
  // ============================================

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      priority: '',
      source: '',
      search: '',
      startDate: '',
      endDate: '',
      isRead: '',
      isStarred: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // ============================================
  // Export
  // ============================================

  const exportEnquiries = useCallback(async (format = 'csv') => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await enquiryAPI.exportEnquiries(format, params);
      
      if (format === 'json') {
        // Download JSON
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `enquiries-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast.success('Export completed', { id: 'export' });
    } catch (err) {
      toast.error(err.message || 'Failed to export', { id: 'export' });
    }
  }, [filters]);

  // ============================================
  // Computed Values
  // ============================================

  const isAllSelected = useMemo(() => {
    return enquiries.length > 0 && selectedIds.length === enquiries.length;
  }, [enquiries.length, selectedIds.length]);

  const hasSelection = useMemo(() => {
    return selectedIds.length > 0;
  }, [selectedIds.length]);

  const unreadCount = useMemo(() => {
    return stats?.unread || enquiries.filter(e => !e.isRead).length;
  }, [stats, enquiries]);

  // ============================================
  // Effects
  // ============================================

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ============================================
  // Return
  // ============================================

  return {
    // Data
    enquiries,
    loading,
    error,
    stats,
    selectedEnquiry,
    selectedIds,
    pagination,
    filters,

    // Computed
    isAllSelected,
    hasSelection,
    unreadCount,

    // Single Operations
    getEnquiry,
    updateEnquiry,
    deleteEnquiry,
    updateStatus,
    updatePriority,
    markAsRead,
    markAsUnread,
    toggleStar,
    archiveEnquiry,
    addNote,
    addResponse,

    // Bulk Operations
    bulkMarkAsRead,
    bulkMarkAsUnread,
    bulkArchive,
    bulkUpdateStatus,
    bulkDelete,

    // Selection
    toggleSelect,
    selectAll,
    clearSelection,
    setSelectedEnquiry,

    // Filters & Pagination
    updateFilters,
    resetFilters,
    goToPage,
    changeLimit,

    // Actions
    fetchEnquiries,
    fetchStats,
    exportEnquiries,
    refresh: () => {
      fetchEnquiries();
      fetchStats();
    },
  };
};

export default useEnquiries;