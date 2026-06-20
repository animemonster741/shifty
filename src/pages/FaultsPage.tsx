import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { FaultsTab } from '@/pages/tabs/FaultsTab';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginPage } from '@/pages/Login';
import { Loader2 } from 'lucide-react';

export function FaultsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { direction, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <Header />
      <main className="container px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              {direction === 'rtl' ? t('common.back') : t('common.back')}
            </Link>
          </Button>
        </div>
        <FaultsTab />
      </main>
    </div>
  );
}
