import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const token = localStorage.getItem('adminToken');

  // If already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If not logged in, show the public page (login/signup)
  return children;
}