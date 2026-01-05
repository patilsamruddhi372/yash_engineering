import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin Auth Components
import AdminLogin from './admin/layout/auth/AdminLogin';

// Admin Protected Components
import AdminDashboard from './admin/layout/pages/Dashboard';
import AdminProducts from './admin/layout/pages/Products';
import AdminServices from './admin/layout/pages/Services';
import AdminClients from './admin/layout/pages/Clients';
import AdminGallery from './admin/layout/pages/Gallery';
import AdminEnquiries from './admin/layout/pages/Enquiries';
// import AdminSettings from './admin/layout/pages/Settings';

// Route Guards
import ProtectedRoute from './admin/layout/auth/ProtectedRoute';
import PublicRoute from './admin/layout/auth/PublicRoute';

// Layouts
import UserLayout from './admin/layout/UserLayout'; // ✅ Single page layout
import AdminLayout from './admin/layout/AdminLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* ========== PUBLIC USER ROUTES (Single Page) ========== */}
        <Route path="/" element={<UserLayout />} />

        {/* ========== ADMIN AUTH ROUTES (Public - Redirect if logged in) ========== */}
        <Route path="/admin/login" element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } />

        {/* ========== ADMIN PROTECTED ROUTES (Requires Login) ========== */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          {/* <Route path="settings" element={<AdminSettings />} /> */}
        </Route>

        {/* ========== 404 NOT FOUND ========== */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
              <a href="/" className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors">
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;