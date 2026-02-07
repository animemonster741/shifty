import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Link as LinkIcon, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddKnowledgeBaseItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: { id: string; name: string }[];
  onSuccess: () => void;
}

export function AddKnowledgeBaseItemModal({
  open,
  onOpenChange,
  teams,
  onSuccess,
}: AddKnowledgeBaseItemModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemType, setItemType] = useState<'file' | 'link'>('file');
  const [customName, setCustomName] = useState('');
  const [url, setUrl] = useState('');
  const [teamId, setTeamId] = useState<string>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setItemType('file');
    setCustomName('');
    setUrl('');
    setTeamId('none');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (Word documents)
      const validTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(doc|docx)$/i)) {
        toast.error(
          language === 'he'
            ? 'ניתן להעלות רק קבצי Word (.doc, .docx)'
            : 'Only Word documents (.doc, .docx) are allowed'
        );
        return;
      }
      // Validate file size (max 25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast.error(
          language === 'he'
            ? 'גודל הקובץ המקסימלי הוא 25MB'
            : 'Maximum file size is 25MB'
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (itemType === 'file' && !selectedFile) {
      toast.error(language === 'he' ? 'נא לבחור קובץ' : 'Please select a file');
      return;
    }
    if (itemType === 'link' && !url.trim()) {
      toast.error(language === 'he' ? 'נא להזין כתובת URL' : 'Please enter a URL');
      return;
    }

    setIsSubmitting(true);

    try {
      let filePath: string | null = null;
      let fileName: string | null = null;

      // Upload file if type is file
      if (itemType === 'file' && selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        filePath = uniqueFileName;
        fileName = selectedFile.name;

        const { error: uploadError } = await supabase.storage
          .from('knowledge-base')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }
      }

      // Insert record
      const { error: insertError } = await supabase
        .from('knowledge_base_items')
        .insert({
          title: customName.trim() || null,
          item_type: itemType,
          url: itemType === 'link' ? url.trim() : null,
          file_path: filePath,
          file_name: fileName,
          team_id: teamId !== 'none' ? teamId : null,
          created_by: user?.id || null,
        });

      if (insertError) {
        // Rollback file upload if DB insert fails
        if (filePath) {
          await supabase.storage.from('knowledge-base').remove([filePath]);
        }
        throw insertError;
      }

      toast.success(
        language === 'he' ? 'הפריט נוסף בהצלחה' : 'Item added successfully'
      );
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(
        language === 'he' ? 'שגיאה בהוספת הפריט' : 'Error adding item'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'he' ? 'הוספה לבסיס הידע' : 'Add to Knowledge Base'}
          </DialogTitle>
          <DialogDescription>
            {language === 'he'
              ? 'הוספת מסמך Word או קישור'
              : 'Add a Word document or hyperlink'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Selection */}
          <Tabs value={itemType} onValueChange={(v) => setItemType(v as 'file' | 'link')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="gap-2">
                <FileText className="h-4 w-4" />
                {language === 'he' ? 'קובץ' : 'File'}
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-2">
                <LinkIcon className="h-4 w-4" />
                {language === 'he' ? 'קישור' : 'Link'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4 space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>{language === 'he' ? 'קובץ Word' : 'Word Document'}</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {language === 'he'
                          ? 'לחץ לבחירת קובץ (.doc, .docx)'
                          : 'Click to select file (.doc, .docx)'}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-4 space-y-4">
              {/* URL Input */}
              <div className="space-y-2">
                <Label>{language === 'he' ? 'כתובת URL' : 'URL'}</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  dir="ltr"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Custom Name (Optional) */}
          <div className="space-y-2">
            <Label>
              {language === 'he' ? 'שם מותאם (אופציונלי)' : 'Custom Name (Optional)'}
            </Label>
            <Input
              placeholder={language === 'he' ? 'שם תצוגה...' : 'Display name...'}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {language === 'he'
                ? 'אם לא יוזן, יוצג שם הקובץ'
                : 'If not provided, the filename will be displayed'}
            </p>
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <Label>{language === 'he' ? 'צוות' : 'Team'}</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'he' ? 'בחר צוות...' : 'Select team...'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {language === 'he' ? 'כל הצוותים' : 'All Teams'}
                </SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                {language === 'he' ? 'מוסיף...' : 'Adding...'}
              </>
            ) : (
              language === 'he' ? 'הוספה' : 'Add'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
