import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Pencil, Trash2, BookOpen, FileText, Link as LinkIcon, Search, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeBaseItem {
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

interface Team {
  id: string;
  name: string;
}

export function KnowledgeBaseManagement() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Edit modal
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editTeamId, setEditTeamId] = useState<string>('');

  // Delete confirmation
  const [deletingItem, setDeletingItem] = useState<KnowledgeBaseItem | null>(null);

  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkTeamId, setBulkTeamId] = useState<string>('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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
      toast.error(language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Error loading data');
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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const displayName = item.title || item.file_name || '';
      const matchesSearch = searchQuery.trim() === '' || 
        displayName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTeam = teamFilter === 'all' || 
        item.team_id === teamFilter || 
        (teamFilter === 'none' && !item.team_id);

      return matchesSearch && matchesTeam;
    });
  }, [items, searchQuery, teamFilter]);

  const handleEditItem = async () => {
    if (!editingItem) return;

    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        title: editTitle.trim() || null,
        team_id: editTeamId === 'none' ? null : editTeamId || null,
      };

      // Only update URL for link type items
      if (editingItem.item_type === 'link') {
        updateData.url = editUrl.trim();
      }

      const { error } = await supabase
        .from('knowledge_base_items')
        .update(updateData)
        .eq('id', editingItem.id);

      if (error) throw error;

      toast.success(language === 'he' ? 'הפריט עודכן בהצלחה' : 'Item updated successfully');
      setEditingItem(null);
      fetchItems();
    } catch (error: unknown) {
      console.error('Error updating item:', error);
      toast.error(language === 'he' ? 'שגיאה בעדכון הפריט' : 'Error updating item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      // Delete file from storage if it exists
      if (deletingItem.file_path) {
        const { error: storageError } = await supabase.storage
          .from('knowledge-base')
          .remove([deletingItem.file_path]);
        if (storageError) console.error('Error deleting file:', storageError);
      }

      const { error } = await supabase
        .from('knowledge_base_items')
        .delete()
        .eq('id', deletingItem.id);

      if (error) throw error;

      toast.success(language === 'he' ? 'הפריט נמחק בהצלחה' : 'Item deleted successfully');
      setDeletingItem(null);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(deletingItem.id);
        return newSet;
      });
      fetchItems();
    } catch (error: unknown) {
      console.error('Error deleting item:', error);
      toast.error(language === 'he' ? 'שגיאה במחיקת הפריט' : 'Error deleting item');
    }
  };

  const handleBulkUpdateTeam = async () => {
    if (selectedItems.size === 0 || !bulkTeamId) return;

    setIsBulkUpdating(true);
    try {
      const teamIdValue = bulkTeamId === 'none' ? null : bulkTeamId;
      
      const { error } = await supabase
        .from('knowledge_base_items')
        .update({ team_id: teamIdValue })
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      toast.success(
        language === 'he' 
          ? `${selectedItems.size} פריטים עודכנו בהצלחה` 
          : `${selectedItems.size} items updated successfully`
      );
      setSelectedItems(new Set());
      setBulkTeamId('');
      fetchItems();
    } catch (error: unknown) {
      console.error('Error bulk updating items:', error);
      toast.error(language === 'he' ? 'שגיאה בעדכון הפריטים' : 'Error updating items');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const openEditModal = (item: KnowledgeBaseItem) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditUrl(item.url || '');
    setEditTeamId(item.team_id || 'none');
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const getDisplayName = (item: KnowledgeBaseItem | null) => {
    if (!item) return '';
    return item.title || item.file_name || (language === 'he' ? 'ללא שם' : 'Untitled');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {language === 'he' ? 'ניהול בסיס ידע' : 'Knowledge Base Management'}
          </CardTitle>
          <CardDescription>
            {language === 'he' ? 'עריכת פריטים, שינוי צוותים והסרת תוכן' : 'Edit items, change teams, and remove content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'he' ? 'חיפוש לפי שם...' : 'Search by name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 input-noc"
              />
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full sm:w-48 input-noc">
                <SelectValue placeholder={language === 'he' ? 'כל הצוותים' : 'All Teams'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'he' ? 'כל הצוותים' : 'All Teams'}</SelectItem>
                <SelectItem value="none">{language === 'he' ? 'ללא צוות' : 'No Team'}</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedItems.size > 0 && (
        <Card className="card-elevated border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="font-medium">
                {language === 'he' 
                  ? `נבחרו ${selectedItems.size} פריטים` 
                  : `${selectedItems.size} items selected`}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <Select value={bulkTeamId} onValueChange={setBulkTeamId}>
                  <SelectTrigger className="w-full sm:w-48 input-noc">
                    <SelectValue placeholder={language === 'he' ? 'שנה צוות ל...' : 'Change team to...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === 'he' ? 'ללא צוות' : 'No Team'}</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleBulkUpdateTeam}
                  disabled={!bulkTeamId || isBulkUpdating}
                  variant="glow"
                >
                  {isBulkUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin me-2" />
                  ) : null}
                  {language === 'he' ? 'עדכון מרובה' : 'Bulk Update'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedItems(new Set())}
                >
                  {language === 'he' ? 'ביטול בחירה' : 'Clear Selection'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'he' ? 'כל הפריטים' : 'All Items'}
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredItems.length})
                </span>
              </CardTitle>
              <CardDescription>
                {language === 'he' ? 'קבצים וקישורים בבסיס הידע' : 'Files and links in the knowledge base'}
              </CardDescription>
            </div>
            {filteredItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
                {selectedItems.size === filteredItems.length
                  ? (language === 'he' ? 'בטל בחירת הכל' : 'Deselect All')
                  : (language === 'he' ? 'בחר הכל' : 'Select All')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === 'he' ? 'לא נמצאו פריטים' : 'No items found'}
            </p>
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedItems.has(item.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 hover:bg-muted/70'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="w-4 h-4 rounded border-muted-foreground/30"
                    />
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                      {item.item_type === 'file' ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <LinkIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{getDisplayName(item)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.item_type === 'file' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {item.item_type === 'file' 
                            ? (language === 'he' ? 'קובץ' : 'File')
                            : (language === 'he' ? 'קישור' : 'Link')}
                        </span>
                        {item.team && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {item.team.name}
                          </span>
                        )}
                      </div>
                      {item.item_type === 'link' && item.url && (
                        <p className="text-xs text-muted-foreground truncate">{item.url}</p>
                      )}
                      {item.item_type === 'file' && item.file_name && (
                        <p className="text-xs text-muted-foreground truncate">{item.file_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingItem(item)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'עריכת פריט' : 'Edit Item'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' ? 'עדכון פרטי הפריט' : 'Update item details'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'he' ? 'שם תצוגה' : 'Display Name'}</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder={editingItem?.file_name || (language === 'he' ? 'שם מותאם אישית' : 'Custom name')}
                className="input-noc"
              />
            </div>
            {editingItem?.item_type === 'link' && (
              <div className="space-y-2">
                <Label>{language === 'he' ? 'כתובת URL' : 'URL'}</Label>
                <Input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="input-noc"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>{language === 'he' ? 'צוות' : 'Team'}</Label>
              <Select value={editTeamId} onValueChange={setEditTeamId}>
                <SelectTrigger className="input-noc">
                  <SelectValue placeholder={language === 'he' ? 'בחר צוות' : 'Select team'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{language === 'he' ? 'ללא צוות' : 'No Team'}</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleEditItem} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {language === 'he' ? 'שומר...' : 'Saving...'}
                </>
              ) : (
                language === 'he' ? 'שמור' : 'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'he' ? 'מחיקת פריט' : 'Delete Item'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he'
                ? `האם אתה בטוח שברצונך למחוק את "${getDisplayName(deletingItem!)}"? פעולה זו לא ניתנת לביטול.`
                : `Are you sure you want to delete "${getDisplayName(deletingItem!)}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'he' ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'he' ? 'מחק' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
