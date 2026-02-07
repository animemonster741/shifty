import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Loader2, Plus, Search, FileText, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KnowledgeBaseItemCard } from '@/components/knowledge-base/KnowledgeBaseItemCard';
import { AddKnowledgeBaseItemModal } from '@/components/knowledge-base/AddKnowledgeBaseItemModal';

export interface KnowledgeBaseItem {
  id: string;
  title: string | null;
  item_type: 'file' | 'link';
  url: string | null;
  file_path: string | null;
  file_name: string | null;
  team_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  team?: { id: string; name: string } | null;
}

export function KnowledgeBaseTab() {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  useEffect(() => {
    fetchItems();
    fetchTeams();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_base_items')
        .select('*, team:teams(id, name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data as unknown as KnowledgeBaseItem[]) || []);
    } catch (error) {
      console.error('Error fetching knowledge base items:', error);
      toast.error(t('common.noData'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleDelete = async (id: string, filePath?: string | null) => {
    try {
      // Delete file from storage if it exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('knowledge-base')
          .remove([filePath]);
        if (storageError) console.error('Error deleting file:', storageError);
      }

      // Delete record from database
      const { error } = await supabase
        .from('knowledge_base_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast.success(language === 'he' ? 'הפריט נמחק בהצלחה' : 'Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(language === 'he' ? 'שגיאה במחיקת הפריט' : 'Error deleting item');
    }
  };

  const handleItemAdded = () => {
    fetchItems();
    setIsAddModalOpen(false);
  };

  // Filter items based on search query and team filter
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      const displayName = item.title || item.file_name || '';
      const matchesSearch = searchQuery.trim() === '' || 
        displayName.toLowerCase().includes(searchQuery.toLowerCase());

      // Team filter
      const matchesTeam = teamFilter === 'all' || 
        item.team_id === teamFilter || 
        (teamFilter === 'none' && !item.team_id);

      return matchesSearch && matchesTeam;
    });
  }, [items, searchQuery, teamFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search, filter, and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'he' ? 'חיפוש לפי שם...' : 'Search by name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>

          {/* Team filter */}
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={language === 'he' ? 'כל הצוותים' : 'All Teams'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'he' ? 'כל הצוותים' : 'All Teams'}</SelectItem>
              <SelectItem value="none">{language === 'he' ? 'ללא צוות' : 'No Team'}</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add button - Admin only */}
        {isAdmin && (
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 me-2" />
            {language === 'he' ? 'הוספה חדשה' : 'Add New'}
          </Button>
        )}
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'he' ? 'לא נמצאו פריטים' : 'No items found'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery || teamFilter !== 'all'
              ? (language === 'he' ? 'נסה לשנות את הסינון' : 'Try adjusting your filters')
              : (language === 'he' ? 'מנהלים יכולים להוסיף מסמכים וקישורים' : 'Admins can add documents and links')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <KnowledgeBaseItemCard
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddKnowledgeBaseItemModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        teams={teams}
        onSuccess={handleItemAdded}
      />
    </div>
  );
}
