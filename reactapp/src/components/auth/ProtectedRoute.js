import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireSuperAdmin = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isSuperAdmin, isAdmin, loading, user } = useAuth();

  // Debug logging
  console.log('🔐 ProtectedRoute Check:');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - user:', user);
  console.log('  - isAdmin:', isAdmin);
  console.log('  - isSuperAdmin:', isSuperAdmin);
  console.log('  - loading:', loading);
  console.log('  - requireAdmin:', requireAdmin);
  console.log('  - requireSuperAdmin:', requireSuperAdmin);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    console.log('❌ Not Super Admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && !isAdmin && !isSuperAdmin) {
    console.log('❌ Not Admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Access granted');
  return children;
};

export default ProtectedRoute;