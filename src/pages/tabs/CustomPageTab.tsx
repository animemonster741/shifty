import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, FileText } from 'lucide-react';

interface CustomPageTabProps {
  tabId: string;
}

export function CustomPageTab({ tabId }: CustomPageTabProps) {
  const { t, direction } = useLanguage();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [tabId]);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('custom_pages')
        .select('content')
        .eq('tab_id', tabId)
        .single();

      if (fetchError) throw fetchError;
      setContent(data?.content || '');
    } catch (err) {
      console.error('Error fetching custom page:', err);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('nav.noContent')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div 
        className="prose prose-invert max-w-none custom-page-content card-elevated p-6 rounded-lg"
        dir={direction}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
