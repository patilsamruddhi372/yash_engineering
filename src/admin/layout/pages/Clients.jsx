// Clients.jsx
import {
  Building2,
  Factory,
  Award,
  Star,
  CheckCircle,
  Users,
  Briefcase,
  Shield,
  Target,
  Search,
  Grid3x3,
  List,
  Zap,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { clientAPI } from '../../../api/axios';

const ITEMS_PER_PAGE = 8;

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <Check className="h-5 w-5 text-green-600" />,
          text: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: <AlertCircle className="h-5 w-5 text-red-600" />,
          text: 'text-red-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <Info className="h-5 w-5 text-blue-600" />,
          text: 'text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: <Info className="h-5 w-5 text-gray-600" />,
          text: 'text-gray-800',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-[60] animate-slide-in-down">
      <div className={`flex items-center gap-3 ${styles.bg} px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md`}>
        {styles.icon}
        <p className={`flex-1 text-sm font-medium ${styles.text}`}>{message}</p>
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState(null);

  const [newClient, setNewClient] = useState({
    name: '',
    address: '',
    status: 'Active',
    since: new Date().getFullYear().toString(),
    rating: 5,
  });

  const [editClient, setEditClient] = useState(null);

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientAPI.getClients({ status: 'Active' });
      
      // Response is already an array
      const clientsData = Array.isArray(response) ? response : [];
      
      console.log('✅ Loaded', clientsData.length, 'clients');
      setClients(clientsData);
      
    } catch (err) {
      console.error('❌ Error loading clients:', err);
      setError(err.message || 'Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const getClientId = (client) => client._id || client.id;

  // Filter clients based on search term
  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedClients = showAll
    ? filteredClients
    : filteredClients.slice(0, ITEMS_PER_PAGE);

  const hasMoreClients = filteredClients.length > ITEMS_PER_PAGE;

  const averageRating =
    clients.length > 0
      ? (
          clients.reduce((sum, client) => sum + (client.rating || 0), 0) /
          clients.length
        ).toFixed(1)
      : '0.0';

  const clientStats = [
    {
      icon: Users,
      number: clients.length.toString(),
      label: 'Total Clients',
      color: 'text-black',
      bg: 'bg-yellow-100',
    },
    {
      icon: Award,
      number: '500+',
      label: 'Projects',
      color: 'text-black',
      bg: 'bg-yellow-100',
    },
    {
      icon: Star,
      number: averageRating,
      label: 'Avg. Rating',
      color: 'text-black',
      bg: 'bg-yellow-100',
    },
  ];

  const getClientIcon = (index) => {
    const icons = [Factory, Building2, Zap, Briefcase, Shield, Target];
    return icons[index % icons.length];
  };

  const getClientColor = (index) => {
    const colors = [
      {
        bg: 'from-yellow-50 to-yellow-100',
        hover: 'group-hover:from-yellow-100 group-hover:to-yellow-200',
        icon: 'text-black',
      },
      {
        bg: 'from-amber-50 to-amber-100',
        hover: 'group-hover:from-amber-100 group-hover:to-amber-200',
        icon: 'text-black',
      },
      {
        bg: 'from-yellow-100 to-yellow-200',
        hover: 'group-hover:from-yellow-200 group-hover:to-yellow-300',
        icon: 'text-black',
      },
      {
        bg: 'from-stone-50 to-stone-100',
        hover: 'group-hover:from-stone-100 group-hover:to-stone-200',
        icon: 'text-black',
      },
      {
        bg: 'from-yellow-50 to-amber-50',
        hover: 'group-hover:from-yellow-100 group-hover:to-amber-100',
        icon: 'text-black',
      },
      {
        bg: 'from-amber-50 to-yellow-100',
        hover: 'group-hover:from-amber-100 group-hover:to-yellow-200',
        icon: 'text-black',
      },
    ];
    return colors[index % colors.length];
  };

  // CRUD: Add
  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      showToast('Please enter client name', 'error');
      return;
    }

    try {
      console.log('➕ Adding new client:', newClient);
      
      const response = await clientAPI.createClient(newClient);
      
      console.log('✅ Client created:', response);
      
      // Add to local state
      setClients((prev) => [response, ...prev]);

      // Show success message
      showToast(`Client "${response.name}" added successfully!`, 'success');

      // Reset form
      setNewClient({
        name: '',
        address: '',
        status: 'Active',
        since: new Date().getFullYear().toString(),
        rating: 5,
      });
      
      setShowAddModal(false);
    } catch (err) {
      console.error('❌ Error adding client:', err);
      showToast(err.message || 'Failed to add client. Please try again.', 'error');
    }
  };

  // CRUD: Edit
  const handleEditClick = (client) => {
    setSelectedClient(client);
    setEditClient({ ...client });
    setShowEditModal(true);
  };

  const handleUpdateClient = async () => {
    if (!editClient.name.trim()) {
      showToast('Please enter client name', 'error');
      return;
    }

    const clientId = getClientId(selectedClient);

    try {
      console.log('✏️ Updating client:', clientId, editClient);
      
      const response = await clientAPI.updateClient(clientId, editClient);
      
      console.log('✅ Client updated:', response);
      
      // Update local state
      setClients((prev) =>
        prev.map((c) => (getClientId(c) === getClientId(response) ? response : c))
      );
      
      // Show success message
      showToast(`Client "${response.name}" updated successfully!`, 'success');
      
      setShowEditModal(false);
      setEditClient(null);
      setSelectedClient(null);
    } catch (err) {
      console.error('❌ Error updating client:', err);
      showToast(err.message || 'Failed to update client. Please try again.', 'error');
    }
  };

  // CRUD: Delete
  const handleDelete = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const clientId = getClientId(selectedClient);
    const clientName = selectedClient.name;

    try {
      console.log('🗑️ Deleting client:', clientId);
      
      await clientAPI.deleteClient(clientId);
      
      console.log('✅ Client deleted');
      
      // Remove from local state
      setClients((prev) => prev.filter((c) => getClientId(c) !== clientId));
      
      // Show success message
      showToast(`Client "${clientName}" deleted successfully!`, 'success');
      
      setShowDeleteModal(false);
      setSelectedClient(null);
    } catch (err) {
      console.error('❌ Error deleting client:', err);
      showToast(err.message || 'Failed to delete client. Please try again.', 'error');
    }
  };

  const handleView = (client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditClient((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewClient((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleShowMore = () => setShowAll(true);
  const handleShowLess = () => {
    setShowAll(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-medium text-sm sm:text-base">
            Loading clients from database...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-8">
          <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Failed to Load Clients
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchClients}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes slide-in-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in-down {
          animation: slide-in-down 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-yellow-300 rounded-lg shadow-sm">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-black">
                Our Trusted Clients
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-700">
              {clients.length > 0
                ? `Proud to serve ${clients.length}+ companies`
                : 'Start adding your clients'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-1 border border-yellow-200 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 sm:flex-none p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-yellow-300 text-black shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <Grid3x3 className="h-4 w-4 mx-auto sm:mx-0" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 sm:flex-none p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-yellow-300 text-black shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                <List className="h-4 w-4 mx-auto sm:mx-0" />
              </button>
            </div>

            {/* Add Client */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 sm:py-2 rounded-lg font-semibold transition-colors shadow-sm border border-yellow-500 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {clientStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4 sm:p-6 hover:shadow-md hover:border-yellow-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                  <div
                    className={`p-1.5 sm:p-2 ${stat.bg} rounded-lg border border-yellow-200`}
                  >
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-xl sm:text-2xl font-semibold text-black">
                      {stat.number}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-700 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        {clients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base border border-yellow-200 rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300/60 focus:outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-yellow-100 text-xs sm:text-sm text-slate-700">
              Showing{' '}
              <strong className="text-black">{displayedClients.length}</strong> of{' '}
              <strong className="text-black">{filteredClients.length}</strong> clients
              {filteredClients.length !== clients.length && (
                <span> (filtered from {clients.length} total)</span>
              )}
            </div>
          </div>
        )}

        {/* Rest of the component remains the same... */}
        {/* [All the existing code for client list, modals, etc. stays exactly the same] */}
        
        {/* Clients list */}
        {filteredClients.length > 0 ? (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'
                  : 'space-y-3'
              }
            >
              {displayedClients.map((client, index) => {
                const Icon = getClientIcon(index);
                const colors = getClientColor(index);
                const clientId = getClientId(client);

                if (viewMode === 'list') {
                  return (
                    <div
                      key={clientId}
                      className="group bg-white rounded-xl shadow-sm border border-yellow-100 hover:shadow-md hover:border-yellow-300 transition-all p-3 sm:p-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center border border-yellow-200 ${colors.hover} transition-all`}
                        >
                          <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${colors.icon}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-black group-hover:text-yellow-700 transition-colors truncate">
                            {client.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span className="text-xs sm:text-sm text-slate-600">
                              {client.status}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-400 mx-1">•</span>
                            <span className="text-xs sm:text-sm text-slate-600">
                              Since {client.since}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:opacity-0 group-hover:opacity-100 items-center gap-1 sm:gap-2 transition-opacity">
                          <button
                            onClick={() => handleView(client)}
                            className="p-1.5 sm:p-2 text-slate-600 hover:text-black hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-yellow-200"
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(client)}
                            className="p-1.5 sm:p-2 text-slate-600 hover:text-black hover:bg-yellow-100 rounded-lg transition-colors border border-transparent hover:border-yellow-300"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="p-1.5 sm:p-2 text-slate-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors border border-transparent hover:border-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Grid View
                return (
                  <div
                    key={clientId}
                    className="group bg-white rounded-xl shadow-sm border border-yellow-100 hover:border-yellow-300 hover:shadow-md transition-all duration-300 p-4 sm:p-6 hover:-translate-y-1"
                  >
                    <div
                      className={`w-full h-24 sm:h-32 bg-gradient-to-br ${colors.bg} rounded-lg flex items-center justify-center mb-3 sm:mb-4 border border-yellow-200 ${colors.hover} transition-all`}
                    >
                      <Icon className={`h-12 w-12 sm:h-16 sm:w-16 ${colors.icon}`} />
                    </div>

                    <h3 className="font-semibold text-base sm:text-lg text-black mb-3 group-hover:text-yellow-700 transition-colors line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
                      {client.name}
                    </h3>

                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                        <span>{client.status} Client</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                        <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        <span>Since {client.since}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 sm:pt-4 border-t border-yellow-100">
                      <button
                        onClick={() => handleView(client)}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-black bg-yellow-50 hover:bg-yellow-100 rounded-lg font-semibold transition-colors border border-yellow-200"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => handleEditClick(client)}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-black bg-yellow-300 hover:bg-yellow-400 rounded-lg font-semibold transition-colors border border-yellow-500"
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        className="p-1.5 sm:p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors border border-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More / Less */}
            {hasMoreClients && (
              <div className="flex justify-center pt-4">
                {!showAll ? (
                  <button
                    onClick={handleShowMore}
                    className="group flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-yellow-500"
                  >
                    <span>Show More Clients</span>
                    <ChevronDown className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                    <span className="ml-1 px-2 py-0.5 bg-black/10 rounded-full text-xs">
                      +{filteredClients.length - ITEMS_PER_PAGE}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleShowLess}
                    className="group flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md border border-yellow-300"
                  >
                    <span>Show Less</span>
                    <ChevronUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-yellow-50 rounded-full mb-4 border border-yellow-200">
              <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-sm sm:text-base text-slate-700 mb-6">
              {searchTerm
                ? `No clients match your search "${searchTerm}"`
                : 'Start by adding your first client'}
            </p>
            <button
              onClick={() => (searchTerm ? setSearchTerm('') : setShowAddModal(true))}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 border border-yellow-500"
            >
              {searchTerm ? 'Clear Search' : 'Add First Client'}
            </button>
          </div>
        )}

        {/* All Modal components remain exactly the same */}
        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl sm:w-full p-4 sm:p-6 border border-yellow-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-black">
                  Add New Client
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewClient({
                      name: '',
                      address: '',
                      status: 'Active',
                      since: new Date().getFullYear().toString(),
                      rating: 5,
                    });
                  }}
                  className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newClient.name}
                    onChange={(e) => handleInputChange(e, false)}
                    placeholder="Enter client name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={newClient.address}
                    onChange={(e) => handleInputChange(e, false)}
                    placeholder="Enter client address"
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={newClient.status}
                      onChange={(e) => handleInputChange(e, false)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                      Client Since
                    </label>
                    <input
                      type="text"
                      name="since"
                      value={newClient.since}
                      onChange={(e) => handleInputChange(e, false)}
                      placeholder="Year"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setNewClient((prev) => ({ ...prev, rating }))
                        }
                        className="transition-all touch-manipulation"
                      >
                        <Star
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            rating <= newClient.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-yellow-100'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 sm:ml-2 text-sm sm:text-base text-slate-700 font-medium">
                      {newClient.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 sticky bottom-0 bg-white pt-4 -mb-4 -mx-4 px-4 pb-4 border-t border-yellow-100">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewClient({
                      name: '',
                      address: '',
                      status: 'Active',
                      since: new Date().getFullYear().toString(),
                      rating: 5,
                    });
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg text-slate-800 font-semibold hover:bg-yellow-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black font-semibold transition-colors border border-yellow-500 shadow-sm"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editClient && (
          <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl sm:w-full p-4 sm:p-6 border border-yellow-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-black">
                  Edit Client
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditClient(null);
                  }}
                  className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editClient.name}
                    onChange={(e) => handleInputChange(e, true)}
                    placeholder="Enter client name"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={editClient.address || ''}
                    onChange={(e) => handleInputChange(e, true)}
                    placeholder="Enter client address"
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editClient.status}
                      onChange={(e) => handleInputChange(e, true)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                      Client Since
                    </label>
                    <input
                      type="text"
                      name="since"
                      value={editClient.since}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="Year"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-300/70 focus:border-yellow-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setEditClient((prev) => ({ ...prev, rating }))
                        }
                        className="transition-all touch-manipulation"
                      >
                        <Star
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${
                            rating <= editClient.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-yellow-100'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-1 sm:ml-2 text-sm sm:text-base text-slate-700 font-medium">
                      {editClient.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 sticky bottom-0 bg-white pt-4 -mb-4 -mx-4 px-4 pb-4 border-t border-yellow-100">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditClient(null);
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg text-slate-800 font-semibold hover:bg-yellow-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClient}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black font-semibold transition-colors border border-yellow-500 shadow-sm"
                >
                  Update Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal remains the same */}
        {showViewModal && selectedClient && (
          <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl sm:w-full overflow-hidden border border-yellow-200 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 p-4 sm:p-6 relative">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-black/10 hover:bg-black/20 backdrop-blur rounded-lg transition-colors border border-black/10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                </button>

                <div className="flex items-center gap-3 sm:gap-4 pr-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg flex items-center justify-center border border-yellow-200 flex-shrink-0">
                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-semibold text-black truncate">
                      {selectedClient.name}
                    </h3>
                    <p className="text-sm sm:text-base text-black/70 font-medium">
                      Trusted Partner
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                    <div className="text-xs sm:text-sm text-slate-700 font-semibold mb-1">
                      Status
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      <span className="text-sm sm:text-base font-semibold text-black">
                        {selectedClient.status}
                      </span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                    <div className="text-xs sm:text-sm text-slate-700 font-semibold mb-1">
                      Client Since
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-black">
                      {selectedClient.since}
                    </p>
                  </div>
                </div>

                {/* Address Section */}
                {selectedClient.address && (
                  <div className="mb-4 sm:mb-6 bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-slate-700 font-semibold">
                        Address
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-black leading-relaxed ml-6 sm:ml-7">
                      {selectedClient.address}
                    </p>
                  </div>
                )}

                <div className="mb-4 sm:mb-6">
                  <div className="text-xs sm:text-sm text-slate-700 font-semibold mb-2">
                    Rating
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Star
                        key={rating}
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          rating <= selectedClient.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-yellow-100'
                        }`}
                      />
                    ))}
                    <span className="ml-1 sm:ml-2 text-sm sm:text-base text-slate-700 font-semibold">
                      {selectedClient.rating}/5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg text-slate-800 font-semibold hover:bg-yellow-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditClick(selectedClient);
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black font-semibold transition-colors border border-yellow-500 shadow-sm"
                  >
                    Edit Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal remains the same */}
        {showDeleteModal && selectedClient && (
          <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md sm:w-full p-5 sm:p-6 border border-red-200">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full mx-auto mb-4 border border-red-200">
                <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-black text-center mb-2">
                Delete Client
              </h3>
              <p className="text-sm sm:text-base text-slate-700 text-center mb-6">
                Are you sure you want to delete{' '}
                <span className="font-semibold">"{selectedClient.name}"</span>? This
                action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-yellow-200 rounded-lg text-slate-800 font-semibold hover:bg-yellow-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors border border-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}