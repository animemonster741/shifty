import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Plus, GripVertical, Eye, EyeOff, Pencil, Trash2, FileText, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

interface NavigationTab {
  id: string;
  tab_key: string;
  label_he: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
  is_system: boolean;
  is_custom_page: boolean;
}

interface CustomPage {
  id: string;
  tab_id: string;
  content: string;
}

const AVAILABLE_ICONS = [
  'FileText', 'BookOpen', 'Info', 'HelpCircle', 'AlertCircle', 
  'Bell', 'Calendar', 'Clock', 'Folder', 'Home',
  'List', 'Map', 'Phone', 'Settings', 'Star',
  'Tag', 'User', 'Users', 'Zap', 'Globe'
];

function SortableItem({ tab, onToggleVisibility, onEdit, onDelete, language }: { 
  tab: NavigationTab;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onEdit: (tab: NavigationTab) => void;
  onDelete: (tab: NavigationTab) => void;
  language: 'en' | 'he';
}) {
  const { t, direction } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[tab.icon] || LucideIcons.FileText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg",
        isDragging && "opacity-50 shadow-lg",
        !tab.is_visible && "opacity-60"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <IconComponent className="h-4 w-4 text-primary shrink-0" />
        <span className="font-medium truncate">
          {language === 'he' ? tab.label_he : tab.label_en}
        </span>
        {tab.is_system && (
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {t('nav.system')}
          </span>
        )}
        {tab.is_custom_page && (
          <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full">
            {t('nav.customPage')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={tab.is_visible}
          onCheckedChange={(checked) => onToggleVisibility(tab.id, checked)}
        />
        
        {tab.is_custom_page && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(tab)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        
        {!tab.is_system && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('nav.deleteTab')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('nav.deleteTabConfirm').replace('{name}', language === 'he' ? tab.label_he : tab.label_en)}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(tab)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export function NavigationManagement() {
  const { t, language, direction } = useLanguage();
  const { user } = useAuth();
  const [tabs, setTabs] = useState<NavigationTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New page modal
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageTitleEn, setNewPageTitleEn] = useState('');
  const [newPageIcon, setNewPageIcon] = useState('FileText');
  const [newPageContent, setNewPageContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit page modal
  const [editingTab, setEditingTab] = useState<NavigationTab | null>(null);
  const [editPageContent, setEditPageContent] = useState('');
  const [editTitleHe, setEditTitleHe] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editIcon, setEditIcon] = useState('FileText');
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('navigation_tabs')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTabs(data || []);
    } catch (error) {
      console.error('Error fetching tabs:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = tabs.findIndex(tab => tab.id === active.id);
    const newIndex = tabs.findIndex(tab => tab.id === over.id);
    
    const newTabs = arrayMove(tabs, oldIndex, newIndex);
    setTabs(newTabs);
    
    // Update display orders in database
    setIsSaving(true);
    try {
      const updates = newTabs.map((tab, index) => ({
        id: tab.id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('navigation_tabs')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        
        if (error) throw error;
      }

      toast.success(t('nav.orderSaved'));
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error(t('common.error'));
      fetchTabs(); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await supabase
        .from('navigation_tabs')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) throw error;

      setTabs(tabs.map(tab => 
        tab.id === id ? { ...tab, is_visible: visible } : tab
      ));
      toast.success(visible ? t('nav.tabShown') : t('nav.tabHidden'));
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error(t('common.error'));
    }
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast.error(t('nav.titleRequired'));
      return;
    }

    setIsCreating(true);
    try {
      const tabKey = `custom_${Date.now()}`;
      const maxOrder = Math.max(...tabs.map(t => t.display_order), 0);

      // Create navigation tab
      const { data: tabData, error: tabError } = await supabase
        .from('navigation_tabs')
        .insert({
          tab_key: tabKey,
          label_he: newPageTitle.trim(),
          label_en: newPageTitleEn.trim() || newPageTitle.trim(),
          icon: newPageIcon,
          display_order: maxOrder + 1,
          is_visible: true,
          is_system: false,
          is_custom_page: true,
        })
        .select()
        .single();

      if (tabError) throw tabError;

      // Create custom page content
      const { error: pageError } = await supabase
        .from('custom_pages')
        .insert({
          tab_id: tabData.id,
          content: newPageContent,
          created_by: user?.id,
        });

      if (pageError) throw pageError;

      toast.success(t('nav.pageCreated'));
      setIsNewPageOpen(false);
      setNewPageTitle('');
      setNewPageTitleEn('');
      setNewPageIcon('FileText');
      setNewPageContent('');
      fetchTabs();
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(t('common.error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTab = async (tab: NavigationTab) => {
    setEditingTab(tab);
    setEditTitleHe(tab.label_he);
    setEditTitleEn(tab.label_en);
    setEditIcon(tab.icon);

    // Fetch page content
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('content')
        .eq('tab_id', tab.id)
        .single();

      if (!error && data) {
        setEditPageContent(data.content || '');
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    }
  };

  const handleUpdatePage = async () => {
    if (!editingTab || !editTitleHe.trim()) {
      toast.error(t('nav.titleRequired'));
      return;
    }

    setIsUpdating(true);
    try {
      // Update navigation tab
      const { error: tabError } = await supabase
        .from('navigation_tabs')
        .update({
          label_he: editTitleHe.trim(),
          label_en: editTitleEn.trim() || editTitleHe.trim(),
          icon: editIcon,
        })
        .eq('id', editingTab.id);

      if (tabError) throw tabError;

      // Update custom page content
      const { error: pageError } = await supabase
        .from('custom_pages')
        .update({ content: editPageContent })
        .eq('tab_id', editingTab.id);

      if (pageError) throw pageError;

      toast.success(t('nav.pageUpdated'));
      setEditingTab(null);
      setEditPageContent('');
      fetchTabs();
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error(t('common.error'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTab = async (tab: NavigationTab) => {
    try {
      const { error } = await supabase
        .from('navigation_tabs')
        .delete()
        .eq('id', tab.id);

      if (error) throw error;

      toast.success(t('nav.tabDeleted'));
      fetchTabs();
    } catch (error) {
      console.error('Error deleting tab:', error);
      toast.error(t('common.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Page */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('nav.addNewPage')}
          </CardTitle>
          <CardDescription>{t('nav.addNewPageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isNewPageOpen} onOpenChange={setIsNewPageOpen}>
            <DialogTrigger asChild>
              <Button variant="glow" className="gap-2">
                <Plus className="h-4 w-4" />
                {t('nav.addNewPage')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('nav.addNewPage')}</DialogTitle>
                <DialogDescription>{t('nav.addNewPageDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('nav.pageTitleHe')}</Label>
                    <Input
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      placeholder={t('nav.pageTitlePlaceholder')}
                      className="input-noc"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('nav.pageTitleEn')}</Label>
                    <Input
                      value={newPageTitleEn}
                      onChange={(e) => setNewPageTitleEn(e.target.value)}
                      placeholder={t('nav.pageTitlePlaceholderEn')}
                      className="input-noc"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('nav.pageIcon')}</Label>
                  <Select value={newPageIcon} onValueChange={setNewPageIcon}>
                    <SelectTrigger className="input-noc w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map(icon => {
                        const Icon = (LucideIcons as any)[icon];
                        return (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {icon}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('nav.pageContent')}</Label>
                  <RichTextEditor
                    content={newPageContent}
                    onChange={setNewPageContent}
                    placeholder={t('nav.pageContentPlaceholder')}
                    className="min-h-[300px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewPageOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="glow" onClick={handleCreatePage} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Save className="me-2 h-4 w-4" />
                      {t('nav.createPage')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Tab Order Management */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GripVertical className="h-5 w-5" />
            {t('nav.reorderTabs')}
          </CardTitle>
          <CardDescription>{t('nav.reorderTabsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tabs.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {tabs.map(tab => (
                  <SortableItem
                    key={tab.id}
                    tab={tab}
                    onToggleVisibility={handleToggleVisibility}
                    onEdit={handleEditTab}
                    onDelete={handleDeleteTab}
                    language={language}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      {/* Edit Page Dialog */}
      <Dialog open={!!editingTab} onOpenChange={(open) => !open && setEditingTab(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('nav.editPage')}</DialogTitle>
            <DialogDescription>{t('nav.editPageDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('nav.pageTitleHe')}</Label>
                <Input
                  value={editTitleHe}
                  onChange={(e) => setEditTitleHe(e.target.value)}
                  className="input-noc"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('nav.pageTitleEn')}</Label>
                <Input
                  value={editTitleEn}
                  onChange={(e) => setEditTitleEn(e.target.value)}
                  className="input-noc"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('nav.pageIcon')}</Label>
              <Select value={editIcon} onValueChange={setEditIcon}>
                <SelectTrigger className="input-noc w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map(icon => {
                    const Icon = (LucideIcons as any)[icon];
                    return (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {icon}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('nav.pageContent')}</Label>
              <RichTextEditor
                content={editPageContent}
                onChange={setEditPageContent}
                placeholder={t('nav.pageContentPlaceholder')}
                className="min-h-[300px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTab(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="glow" onClick={handleUpdatePage} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <Save className="me-2 h-4 w-4" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
