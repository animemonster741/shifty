import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';

interface UsefulLink {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  category: string | null;
  created_at: string;
}

export function LinksTab() {
  const { t } = useLanguage();
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('useful_links')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error(t('common.noData'));
    } finally {
      setIsLoading(false);
    }
  };

  // Group links by category
  const groupedLinks = links.reduce<Record<string, UsefulLink[]>>((acc, link) => {
    const category = link.category || t('links.uncategorized');
    if (!acc[category]) acc[category] = [];
    acc[category].push(link);
    return acc;
  }, {});

  const getIcon = (iconName: string | null) => {
    if (!iconName) return ExternalLink;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon || ExternalLink;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ExternalLink className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('links.noLinks')}</h3>
        <p className="text-muted-foreground">{t('links.noLinksDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
        <div key={category}>
          {Object.keys(groupedLinks).length > 1 && (
            <h2 className="text-lg font-semibold mb-4 text-foreground">{category}</h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categoryLinks.map((link) => {
              const IconComponent = getIcon(link.icon);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square flex flex-col items-center justify-center gap-3 p-4 rounded-xl 
                    bg-card/50 backdrop-blur-sm border border-border/50 
                    hover:border-primary/50 hover:bg-primary/5 
                    transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {link.image_url ? (
                      <img 
                        src={link.image_url} 
                        alt={link.name} 
                        className="w-8 h-8 object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <IconComponent className="h-6 w-6" />
                    )}
                    {link.image_url && <IconComponent className="h-6 w-6 hidden" />}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {link.name}
                    </h3>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="absolute top-2 end-2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
