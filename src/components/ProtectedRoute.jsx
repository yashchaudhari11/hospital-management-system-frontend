import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirects = {
      patient: '/patient',
      assistant: '/assistant',
      doctor: '/doctor',
      lab: '/lab',
      pharmacy: '/pharmacy',
      admin: '/admin'
    };
    return <Navigate to={redirects[user.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
