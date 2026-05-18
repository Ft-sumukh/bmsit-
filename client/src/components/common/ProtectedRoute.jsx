import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = () => {
  const { token, user, checkAuth, isInitialized, loading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  // Render a futuristic loader during verification
  if (!isInitialized || (loading && !user)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#090D16] text-white">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
          <div className="absolute h-8 w-8 rounded-full bg-indigo-500/20 blur-md"></div>
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wider text-slate-400">
          Decrypting Study Session...
        </p>
      </div>
    );
  }

  // Redirect if no local token is present
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Render children routes
  return <Outlet />;
};

export default ProtectedRoute;
