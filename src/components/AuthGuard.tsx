
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      const isAuthPage = location.pathname === '/auth';

      if (!isAuth && !isAuthPage) {
        // Redirect to auth page if not authenticated and not already on auth page
        navigate('/auth');
      } else if (isAuth && isAuthPage) {
        // Redirect to dashboard if already authenticated and trying to access auth page
        navigate('/dashboard');
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  return <>{children}</>;
};

export default AuthGuard;
