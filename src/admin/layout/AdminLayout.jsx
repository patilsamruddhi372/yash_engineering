// client/src/layouts/AdminLayout.jsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Briefcase, 
  Users, 
  Image, 
  MessageSquare,
  Menu,
  X,
  Calendar,
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { brochureAPI } from '../../api/brochureApi';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [activeBrochure, setActiveBrochure] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products',  icon: Package,         label: 'Products' },
    { path: '/admin/services',  icon: Briefcase,       label: 'Services' },
    { path: '/admin/clients',   icon: Users,           label: 'Clients' },
    { path: '/admin/gallery',   icon: Image,           label: 'Gallery' },
    { path: '/admin/enquiries', icon: MessageSquare,   label: 'Enquiries' },
    { path: '/admin/brochures', icon: FileText,        label: 'Brochures' },
  ];

  // Scroll to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const getCurrentPage = () => {
    const currentPath = location.pathname;
    const page = menuItems.find(item => currentPath.startsWith(item.path));
    return page || { label: 'Admin Panel', icon: LayoutDashboard };
  };

  const currentPage = getCurrentPage();

  // Fetch active brochure
  const fetchActiveBrochure = async () => {
    try {
      const response = await brochureAPI.getActive();
      if (response.success && response.data) {
        setActiveBrochure(response.data);
      } else {
        setActiveBrochure(null);
      }
    } catch (error) {
      console.error('Failed to fetch active brochure:', error);
      setActiveBrochure(null);
    }
  };

  useEffect(() => {
    fetchActiveBrochure();
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchActiveBrochure();
    }
  }, [refreshKey]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setLastUpdated(new Date());
    fetchActiveBrochure();
  };

  const handleBrochureClick = () => {
    console.log("🔥 Brochure button clicked! Navigating to /admin/brochures");
    navigate('/admin/brochures');
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex">
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleCloseSidebar}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 transparent'
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-yellow-200 shadow-sm">
            <div className="px-6 py-4 md:px-8 md:py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 mb-2 border border-yellow-300">
                    <Sparkles className="w-4 h-4 text-yellow-700" />
                    <span className="text-xs font-semibold text-yellow-800 uppercase tracking-wide">
                      {currentPage.label}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    {getGreeting()}, Admin! <span className="animate-wave">👋</span>
                  </h1>
                  <p className="text-slate-600 mt-1 flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    {currentDate}
                  </p>
                  {lastUpdated && (
                    <p className="text-xs text-slate-500 mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden p-2.5 text-slate-700 hover:bg-yellow-50 rounded-lg transition-colors border border-slate-200"
                  >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={handleRefresh}
                    className="p-2.5 text-slate-700 hover:bg-yellow-50 rounded-lg transition-colors border border-slate-200"
                    title="Refresh Data"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-300"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                  </select>

                  {/* Brochure Button */}
                  <button
                    onClick={handleBrochureClick}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm border cursor-pointer ${
                      activeBrochure
                        ? "bg-green-50 hover:bg-green-100 text-green-800 border-green-200"
                        : "bg-white hover:bg-yellow-50 text-slate-800 border-slate-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {activeBrochure ? "Manage Brochure" : "Upload Brochure"}
                    </span>
                    <span className="sm:hidden">Brochure</span>
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              {activeBrochure ? (
                <div 
                  onClick={handleBrochureClick}
                  className="mt-3 pt-3 border-t border-yellow-100 flex items-center justify-between cursor-pointer hover:bg-green-50 -mx-6 px-6 md:-mx-8 md:px-8 py-2 transition-colors"
                >
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Active Brochure: <span className="font-semibold">{activeBrochure.title}</span>
                  </p>
                  <span className="text-xs text-green-600 font-medium">Click to manage →</span>
                </div>
              ) : (
                <div 
                  onClick={handleBrochureClick}
                  className="mt-3 pt-3 border-t border-yellow-100 flex items-center justify-between cursor-pointer hover:bg-yellow-50 -mx-6 px-6 md:-mx-8 md:px-8 py-2 transition-colors"
                >
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    No brochure uploaded
                  </p>
                  <span className="text-xs text-amber-600 font-medium">Click to upload →</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <Outlet context={{ refreshKey, onRefresh: handleRefresh }} />
          </div>

          <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Yash Engineering. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <a href="#" className="hover:text-gray-700">Privacy Policy</a>
                <a href="#" className="hover:text-gray-700">Terms of Service</a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <style>{`
        main::-webkit-scrollbar {
          width: 8px;
        }
        main::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        main::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        main::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .overscroll-contain {
          overscroll-behavior: contain;
        }
        main {
          scroll-behavior: smooth;
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}