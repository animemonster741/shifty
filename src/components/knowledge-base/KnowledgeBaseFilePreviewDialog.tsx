import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeHTML } from '@/utils/sanitize';
import mammoth from 'mammoth';
import { toast } from 'sonner';

type PreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; html: string }
  | { status: 'unsupported'; reason: string }
  | { status: 'error'; message: string };

export function KnowledgeBaseFilePreviewDialog({
  open,
  onOpenChange,
  filePath,
  fileName,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
  fileName: string | null;
  title: string;
}) {
  const [state, setState] = useState<PreviewState>({ status: 'idle' });

  const ext = useMemo(() => {
    const name = fileName ?? filePath ?? '';
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }, [fileName, filePath]);

  const publicUrl = useMemo(() => {
    if (!filePath) return null;
    const { data } = supabase.storage.from('knowledge-base').getPublicUrl(filePath);
    return data.publicUrl || null;
  }, [filePath]);

  useEffect(() => {
    if (!open) {
      setState({ status: 'idle' });
      return;
    }
    if (!filePath || !publicUrl) {
      setState({ status: 'error', message: 'Missing file reference' });
      return;
    }

    if (ext === 'doc') {
      setState({
        status: 'unsupported',
        reason: 'Preview for .doc is not supported. Please upload .docx instead.',
      });
      return;
    }
    if (ext !== 'docx') {
      setState({
        status: 'unsupported',
        reason: `Preview for .${ext || 'unknown'} files is not supported.`,
      });
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setState({ status: 'loading' });
      try {
        const res = await fetch(publicUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
        const buffer = await res.arrayBuffer();

        const result = await mammoth.convertToHtml(
          { arrayBuffer: buffer },
          {
            convertImage: mammoth.images.imgElement(async (image) => {
              const imgBuffer = await image.read('base64');
              return { src: `data:${image.contentType};base64,${imgBuffer}` };
            }),
          }
        );

        const safeHtml = sanitizeHTML(result.value);
        setState({ status: 'ready', html: safeHtml });

        if (result.messages?.length) {
          // These are usually non-fatal conversion warnings.
          console.warn('DOCX conversion messages:', result.messages);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        console.error('Preview error:', e);
        setState({ status: 'error', message: e?.message ?? 'Failed to preview file' });
      }
    };

    run();
    return () => controller.abort();
  }, [open, filePath, publicUrl, ext]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col max-h-[90vh]">
          <DialogHeader className="px-6 pt-6 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="truncate">{title}</DialogTitle>
                <div className="text-sm text-muted-foreground font-mono truncate">
                  {fileName ?? filePath ?? ''}
                </div>
              </div>
              {publicUrl && (
                <Button
                  variant="outline"
                  className="shrink-0 gap-2"
                  onClick={() => {
                    window.open(publicUrl, '_blank', 'noopener,noreferrer');
                    toast.message('Opened original file in a new tab');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open original
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="border-t border-border flex-1 overflow-auto px-6 pb-6">
            {state.status === 'loading' && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {state.status === 'unsupported' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{state.reason}</p>
              </div>
            )}

            {state.status === 'error' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{state.message}</p>
              </div>
            )}

            {state.status === 'ready' && (
              <div
                dir="auto"
                className="prose prose-invert max-w-none my-6 text-start"
                dangerouslySetInnerHTML={{ __html: state.html }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default KnowledgeBaseFilePreviewDialog;
