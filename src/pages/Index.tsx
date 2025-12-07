import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
};

export default Index;
