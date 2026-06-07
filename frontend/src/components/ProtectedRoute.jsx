import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12 text-zinc-500 font-semibold">Loading auth...</div>;
  }

  if (!user) {
    // If it's a doctor route, redirect to doctor login, otherwise patient login
    const isDoctorRoute = allowedRoles && allowedRoles.includes('DOCTOR') && !allowedRoles.includes('PATIENT');
    return <Navigate to={isDoctorRoute ? "/doctor/login" : "/login"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in as patient trying to access doctor route, or vice-versa
    return <Navigate to={user.role === 'DOCTOR' ? "/doctor/dashboard" : "/"} replace />;
  }

  return children;
}
