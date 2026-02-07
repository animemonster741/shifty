import { FileText, Link as LinkIcon, ExternalLink, Trash2, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { KnowledgeBaseItem } from '@/pages/tabs/KnowledgeBaseTab';

interface KnowledgeBaseItemCardProps {
  item: KnowledgeBaseItem;
  isAdmin: boolean;
  onDelete: (id: string, filePath?: string | null) => void;
}

export function KnowledgeBaseItemCard({ item, isAdmin, onDelete }: KnowledgeBaseItemCardProps) {
  const { language } = useLanguage();

  // Get display name: custom title > file name > fallback
  const displayName = item.title || item.file_name || (language === 'he' ? 'ללא שם' : 'Untitled');

  // Get file URL for download
  const getFileUrl = () => {
    if (item.file_path) {
      const { data } = supabase.storage
        .from('knowledge-base')
        .getPublicUrl(item.file_path);
      return data.publicUrl;
    }
    return null;
  };

  const handleClick = () => {
    if (item.item_type === 'link' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.item_type === 'file' && item.file_path) {
      const fileUrl = getFileUrl();
      if (fileUrl) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const isWordDocument = item.file_name?.match(/\.(doc|docx)$/i);

  return (
    <div
      className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl 
        bg-card/50 backdrop-blur-sm border border-border/50 
        hover:border-primary/50 hover:bg-primary/5 
        transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10
        cursor-pointer aspect-square"
      onClick={handleClick}
    >
      {/* Icon */}
      <div className="relative flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        {item.item_type === 'file' ? (
          <FileText className="h-6 w-6" />
        ) : (
          <LinkIcon className="h-6 w-6" />
        )}
      </div>

      {/* Name */}
      <div className="text-center px-2">
        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {displayName}
        </h3>
        {item.team && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {item.team.name}
          </p>
        )}
      </div>

      {/* External link indicator */}
      <ExternalLink className="absolute top-2 end-2 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Word doc badge */}
      {isWordDocument && (
        <span className="absolute top-2 start-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/20 text-primary">
          DOCX
        </span>
      )}

      {/* Delete button - Admin only */}
      {isAdmin && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 end-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'he' ? 'מחיקת פריט' : 'Delete Item'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {language === 'he' 
                  ? `האם למחוק את "${displayName}"? פעולה זו לא ניתנת לביטול.`
                  : `Are you sure you want to delete "${displayName}"? This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(item.id, item.file_path)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {language === 'he' ? 'מחיקה' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
