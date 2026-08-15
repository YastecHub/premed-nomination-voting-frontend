import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoriesAdmin from "./pages/admin/Categories";
import NomineesAdmin from "./pages/admin/Nominees";
import Results from "./pages/admin/Results";
import SeedVoters from "./pages/admin/SeedVoters";

function ProtectedRoute({ children, requireRole }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Student routes */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>}
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/categories"
        element={<ProtectedRoute requireRole="admin"><CategoriesAdmin /></ProtectedRoute>}
      />
      <Route
        path="/admin/nominees"
        element={<ProtectedRoute requireRole="admin"><NomineesAdmin /></ProtectedRoute>}
      />
      <Route
        path="/admin/results"
        element={<ProtectedRoute requireRole="admin"><Results /></ProtectedRoute>}
      />
      <Route
        path="/admin/seed"
        element={<ProtectedRoute requireRole="admin"><SeedVoters /></ProtectedRoute>}
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
