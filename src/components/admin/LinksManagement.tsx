import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface UsefulLink {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  image_url: string | null;
  description: string | null;
  category: string | null;
  is_internal: boolean;
  internal_route: string | null;
  created_at: string;
}

const INTERNAL_ROUTES = [
  { value: '/access-control', label_he: 'ניהול כניסה', label_en: 'Access Management' },
  { value: '/tokens', label_he: 'ניהול טוקנים', label_en: 'Token Management' },
  { value: '/knowledge-base', label_he: 'בסיס ידע', label_en: 'Knowledge Base' },
];

const linkSchema = z.object({
  name: z.string().min(2, 'Link name is required').max(100),
  url: z.string().min(1),
  icon: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  description: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
});

const COMMON_ICONS = [
  'Link', 'ExternalLink', 'Globe', 'FileText', 'Database', 'Server', 
  'Monitor', 'Smartphone', 'Settings', 'Wrench', 'Activity', 'BarChart3',
  'PieChart', 'LineChart', 'Users', 'Shield', 'Lock', 'Key',
  'Mail', 'MessageSquare', 'Bell', 'Calendar', 'Clock', 'Bookmark',
  'Star', 'Heart', 'Zap', 'Cpu', 'HardDrive', 'Cloud',
  'Github', 'Gitlab', 'Code', 'Terminal', 'Folder', 'File',
  'DoorOpen',
];

export function LinksManagement() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [linkType, setLinkType] = useState<'external' | 'internal'>('external');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [internalRoute, setInternalRoute] = useState('');
  const [icon, setIcon] = useState('Link');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [formError, setFormError] = useState('');
  
  // Edit modal
  const [editingLink, setEditingLink] = useState<UsefulLink | null>(null);
  const [editLinkType, setEditLinkType] = useState<'external' | 'internal'>('external');
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editInternalRoute, setEditInternalRoute] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Delete confirmation
  const [deletingLink, setDeletingLink] = useState<UsefulLink | null>(null);

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

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const isInternal = linkType === 'internal';
    const finalUrl = isInternal ? internalRoute : url.trim();

    const validation = linkSchema.safeParse({
      name: name.trim(),
      url: finalUrl,
      icon: icon || 'Link',
      image_url: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
      category: category.trim() || undefined,
    });

    if (!validation.success) {
      setFormError(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('useful_links').insert({
        name: name.trim(),
        url: finalUrl,
        icon: icon || 'Link',
        image_url: imageUrl.trim() || null,
        description: description.trim() || null,
        category: category.trim() || null,
        is_internal: isInternal,
        internal_route: isInternal ? internalRoute : null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success(t('links.linkAdded'));
      setName('');
      setUrl('');
      setInternalRoute('');
      setLinkType('external');
      setIcon('Link');
      setImageUrl('');
      setDescription('');
      setCategory('');
      fetchLinks();
    } catch (error: any) {
      console.error('Error adding link:', error);
      setFormError(error.message || 'Failed to add link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditLink = async () => {
    if (!editingLink) return;

    const isInternal = editLinkType === 'internal';
    const finalUrl = isInternal ? editInternalRoute : editUrl.trim();

    const validation = linkSchema.safeParse({
      name: editName.trim(),
      url: finalUrl,
      icon: editIcon || 'Link',
      image_url: editImageUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
      category: editCategory.trim() || undefined,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('useful_links')
        .update({
          name: editName.trim(),
          url: finalUrl,
          icon: editIcon || 'Link',
          image_url: editImageUrl.trim() || null,
          description: editDescription.trim() || null,
          category: editCategory.trim() || null,
          is_internal: isInternal,
          internal_route: isInternal ? editInternalRoute : null,
        })
        .eq('id', editingLink.id);

      if (error) throw error;

      toast.success(t('links.linkUpdated'));
      setEditingLink(null);
      fetchLinks();
    } catch (error: any) {
      console.error('Error updating link:', error);
      toast.error(error.message || 'Failed to update link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deletingLink) return;

    try {
      const { error } = await supabase
        .from('useful_links')
        .delete()
        .eq('id', deletingLink.id);

      if (error) throw error;

      toast.success(t('links.linkDeleted'));
      setDeletingLink(null);
      fetchLinks();
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast.error(error.message || 'Failed to delete link');
    }
  };

  const openEditModal = (link: UsefulLink) => {
    setEditingLink(link);
    setEditLinkType(link.is_internal ? 'internal' : 'external');
    setEditName(link.name);
    setEditUrl(link.is_internal ? '' : link.url);
    setEditInternalRoute(link.internal_route || '');
    setEditIcon(link.icon || 'Link');
    setEditImageUrl(link.image_url || '');
    setEditDescription(link.description || '');
    setEditCategory(link.category || '');
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return ExternalLink;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon || ExternalLink;
  };

  const existingCategories = [...new Set(links.map(l => l.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Add New Link */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('links.addNewLink')}
          </CardTitle>
          <CardDescription>{t('links.addLinkDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLink} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Link Type Toggle */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label>{language === 'he' ? 'סוג קישור' : 'Link Type'}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={linkType === 'external' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLinkType('external')}
                >
                  <ExternalLink className="h-4 w-4 me-2" />
                  {language === 'he' ? 'כתובת חיצונית' : 'External URL'}
                </Button>
                <Button
                  type="button"
                  variant={linkType === 'internal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLinkType('internal')}
                >
                  <LinkIcon className="h-4 w-4 me-2" />
                  {language === 'he' ? 'דף פנימי' : 'Internal Page'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkName">{t('links.linkName')}</Label>
              <Input
                id="linkName"
                type="text"
                placeholder="e.g. Grafana"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(''); }}
                className="input-noc"
              />
            </div>

            {linkType === 'external' ? (
              <div className="space-y-2">
                <Label htmlFor="linkUrl">{t('links.url')}</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setFormError(''); }}
                  className="input-noc"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{language === 'he' ? 'דף פנימי' : 'Internal Page'}</Label>
                <Select value={internalRoute} onValueChange={setInternalRoute}>
                  <SelectTrigger className="input-noc">
                    <SelectValue placeholder={language === 'he' ? 'בחר דף...' : 'Select page...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNAL_ROUTES.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {language === 'he' ? route.label_he : route.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="linkIcon">{t('links.icon')}</Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger className="input-noc">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getIcon(icon);
                        return <IconComponent className="h-4 w-4" />;
                      })()}
                      <span>{icon}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COMMON_ICONS.map((iconName) => {
                    const IconComponent = getIcon(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkImageUrl">{t('links.imageUrl')} <span className="text-muted-foreground text-xs">({t('common.optional')})</span></Label>
              <Input
                id="linkImageUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input-noc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkCategory">{t('links.category')} <span className="text-muted-foreground text-xs">({t('common.optional')})</span></Label>
              <Input
                id="linkCategory"
                type="text"
                placeholder="e.g. Monitoring"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-noc"
                list="categoryList"
              />
              <datalist id="categoryList">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat || ''} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="linkDescription">{t('links.description')} <span className="text-muted-foreground text-xs">({t('common.optional')})</span></Label>
              <Input
                id="linkDescription"
                type="text"
                placeholder={t('links.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-noc"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <Button type="submit" variant="glow" disabled={isSaving} className="w-full sm:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('admin.adding')}
                  </>
                ) : (
                  <>
                    <Plus className="me-2 h-4 w-4" />
                    {t('links.addLink')}
                  </>
                )}
              </Button>
            </div>
          </form>
          {formError && (
            <p className="text-sm text-destructive mt-4 animate-fade-in">{formError}</p>
          )}
        </CardContent>
      </Card>

      {/* Links List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {t('links.allLinks')}
          </CardTitle>
          <CardDescription>{t('links.manageLinksDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : links.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('links.noLinks')}</p>
          ) : (
            <div className="grid gap-3">
              {links.map((link) => {
                const IconComponent = getIcon(link.icon);
                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        {link.image_url ? (
                          <img
                            src={link.image_url}
                            alt={link.name}
                            className="w-6 h-6 object-contain rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <IconComponent className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{link.name}</span>
                          {link.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                              {link.category}
                            </span>
                          )}
                          {link.is_internal && (
                            <Badge variant="outline" className="text-xs">
                              {language === 'he' ? 'דף פנימי' : 'Internal'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {link.is_internal ? link.internal_route : link.url}
                        </p>
                        {link.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(link)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingLink(link)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('links.editLink')}</DialogTitle>
            <DialogDescription>{t('links.editLinkDesc')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Link Type Toggle */}
            <div className="space-y-2">
              <Label>{language === 'he' ? 'סוג קישור' : 'Link Type'}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editLinkType === 'external' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditLinkType('external')}
                >
                  <ExternalLink className="h-4 w-4 me-2" />
                  {language === 'he' ? 'כתובת חיצונית' : 'External URL'}
                </Button>
                <Button
                  type="button"
                  variant={editLinkType === 'internal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEditLinkType('internal')}
                >
                  <LinkIcon className="h-4 w-4 me-2" />
                  {language === 'he' ? 'דף פנימי' : 'Internal Page'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('links.linkName')}</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input-noc"
              />
            </div>

            {editLinkType === 'external' ? (
              <div className="space-y-2">
                <Label>{t('links.url')}</Label>
                <Input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="input-noc"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{language === 'he' ? 'דף פנימי' : 'Internal Page'}</Label>
                <Select value={editInternalRoute} onValueChange={setEditInternalRoute}>
                  <SelectTrigger className="input-noc">
                    <SelectValue placeholder={language === 'he' ? 'בחר דף...' : 'Select page...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERNAL_ROUTES.map((route) => (
                      <SelectItem key={route.value} value={route.value}>
                        {language === 'he' ? route.label_he : route.label_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('links.icon')}</Label>
              <Select value={editIcon} onValueChange={setEditIcon}>
                <SelectTrigger className="input-noc">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getIcon(editIcon);
                        return <IconComponent className="h-4 w-4" />;
                      })()}
                      <span>{editIcon}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COMMON_ICONS.map((iconName) => {
                    const IconComponent = getIcon(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('links.imageUrl')}</Label>
              <Input
                type="url"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="input-noc"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('links.category')}</Label>
              <Input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="input-noc"
                list="editCategoryList"
              />
              <datalist id="editCategoryList">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat || ''} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label>{t('links.description')}</Label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="input-noc"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingLink(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="glow" onClick={handleEditLink} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('settings.updating')}
                </>
              ) : (
                t('admin.saveChanges')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('links.deleteLink')}</DialogTitle>
            <DialogDescription>
              {t('links.deleteLinkConfirm').replace('{name}', deletingLink?.name || '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingLink(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteLink}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
