import { useAuth } from '../hooks/useAuth';
import LoginModal from './LoginModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <LoginModal />;
  }

  return <>{children}</>;
}
