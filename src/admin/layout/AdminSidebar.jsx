// components/AdminSidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Briefcase, 
  Users, 
  Image, 
  MessageSquare, 
  LogOut,
  X,
  Factory,
} from 'lucide-react';
import { useState } from 'react';
import { authAPI } from '../../api/axios';

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/services', icon: Briefcase, label: 'Services' },
    { path: '/admin/clients', icon: Users, label: 'Clients' },
    { path: '/admin/gallery', icon: Image, label: 'Gallery' },
    { path: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  ];

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminEmail');
      navigate('/admin/login', { replace: true });
    }
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar - Light Black/Charcoal Theme */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-slate-700 to-slate-800 text-white
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen shadow-xl border-r border-slate-600
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Sidebar Header */}
        <div className="flex-shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-slate-600 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-400 rounded-lg shadow-md border border-yellow-500">
                  <Factory className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white">Yash Engineering</h1>
                  <p className="text-xs text-slate-300 font-medium">Admin Panel</p>
                </div>
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 hover:bg-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav 
          className="flex-1 p-4 space-y-1.5 overflow-y-auto overscroll-contain scrollbar-thin"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#64748b transparent'
          }}
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-yellow-400 text-slate-900 font-bold shadow-lg border border-yellow-500' 
                  : 'text-slate-200 hover:bg-slate-600 hover:text-white border border-transparent hover:border-slate-500'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info Section */}
        <div className="flex-shrink-0 p-4 border-t border-slate-600 bg-slate-800/50">
          <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-slate-600/50 border border-slate-500">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-bold border-2 border-yellow-500 shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-slate-300 truncate">Administrator</p>
            </div>
          </div>
        </div>

        {/* Logout Button - Fixed at Bottom */}
        <div className="flex-shrink-0 p-4 pt-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border border-red-600"
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Webkit Scrollbar Styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #64748b, #475569);
          border-radius: 3px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #475569, #334155);
        }
      `}</style>
    </>
  );
}