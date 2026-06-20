import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '../../../components/ui/Spinner.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner label="Checking session" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location }} />;

  return children;
}
