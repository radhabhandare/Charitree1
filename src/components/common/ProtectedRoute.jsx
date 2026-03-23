import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - Check:', { 
    user: user?.email, 
    role: user?.role,
    loading,
    allowedRoles,
    path: window.location.pathname
  });

  if (loading) {
    console.log('⏳ ProtectedRoute - Loading...');
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!user) {
    console.log('🚫 ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🚫 ProtectedRoute - Role not allowed:', user.role);
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - Access granted to:', user.role);
  return children;
};

export default ProtectedRoute;