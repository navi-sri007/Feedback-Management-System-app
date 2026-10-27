import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./components/public/LandingPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminFeedbackList from "./components/admin/AdminFeedbackList";
import AdminFeedbackDetail from "./components/admin/AdminFeedbackDetail";
import CategoryManagement from "./components/admin/CategoryManagement";
import AdminManagement from "./components/admin/AdminManagement";
import AdminManagementCreate from "./components/admin/AdminManagementCreate";
import AuditLogList from "./components/admin/AuditLogList";
import UserFeedbackList from "./components/user/UserFeedbackList";
import "./App.css";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes - Everyone can access */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/view-feedbacks" element={<UserFeedbackList />} />

      {/* Protected Routes - Admin Only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedbacks"
        element={
          <ProtectedRoute requireAdmin>
            <AdminFeedbackList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedbacks/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminFeedbackDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute requireAdmin>
            <CategoryManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute requireAdmin>
            <AuditLogList />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Only */}
      <Route
        path="/admins"
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admins/create"
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminManagementCreate />
          </ProtectedRoute>
        }
      />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
