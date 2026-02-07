import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/auth/Login';
import { Dashboard } from '@/pages/trainee/Dashboard';
import { Attendance } from '@/pages/trainee/Attendance';
import { Skills } from '@/pages/trainee/Skills';
import { Lectures } from '@/pages/trainee/Lectures';
import { Exams } from '@/pages/trainee/Exams';
import { TrainerDashboard } from '@/pages/trainer/TrainerDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - Loading:', loading, 'User:', user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting based on role:', user.role);
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin' || user.role === 'super_admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'trainer') {
      return <Navigate to="/trainer" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('Access granted for user:', user.full_name, 'Role:', user.role);
  return <>{children}</>;
};

// Role-based Dashboard Redirect
const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('DashboardRedirect - Loading:', loading, 'User:', user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user in DashboardRedirect, going to login');
    return <Navigate to="/login" replace />;
  }

  console.log('Redirecting user based on role:', user.role);
  
  switch (user.role) {
    case 'admin':
    case 'super_admin':
      return <Navigate to="/admin" replace />;
    case 'trainer':
      return <Navigate to="/trainer" replace />;
    case 'trainee':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Root redirect */}
          <Route path="/" element={<DashboardRedirect />} />

          {/* Protected Routes with Layout */}
          <Route element={<MainLayout />}>
            {/* Trainee Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['trainee']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute allowedRoles={['trainee', 'trainer', 'admin']}>
                  <Attendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skills" 
              element={
                <ProtectedRoute allowedRoles={['trainee', 'trainer', 'admin']}>
                  <Skills />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/lectures" 
              element={
                <ProtectedRoute allowedRoles={['trainee', 'trainer', 'admin']}>
                  <Lectures />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exams" 
              element={
                <ProtectedRoute allowedRoles={['trainee', 'trainer', 'admin']}>
                  <Exams />
                </ProtectedRoute>
              } 
            />

            {/* Trainer Routes */}
            <Route 
              path="/trainer" 
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-trainees" 
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/attendance-approval" 
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/skill-evaluation" 
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/programs" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/centers" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </Router>
    </AuthProvider>
  );
}

export default App;
