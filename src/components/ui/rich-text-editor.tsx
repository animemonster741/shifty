import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table as TableIcon,
  Palette,
  Highlighter,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const TEXT_COLORS = [
  { name: 'Default', value: '' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: '' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Purple', value: '#e9d5ff' },
];

function EditorToolbar({ editor }: { editor: Editor | null }) {
  const { t, direction } = useLanguage();

  if (!editor) return null;

  const toolbarTranslations = {
    bold: t('editor.bold') || 'מודגש',
    italic: t('editor.italic') || 'נטוי',
    underline: t('editor.underline') || 'קו תחתון',
    strikethrough: t('editor.strikethrough') || 'קו חוצה',
    alignLeft: t('editor.alignLeft') || 'יישור לימין',
    alignCenter: t('editor.alignCenter') || 'יישור למרכז',
    alignRight: t('editor.alignRight') || 'יישור לשמאל',
    bulletList: t('editor.bulletList') || 'רשימת תבליטים',
    numberedList: t('editor.numberedList') || 'רשימה ממוספרת',
    insertTable: t('editor.insertTable') || 'הוספת טבלה',
    textColor: t('editor.textColor') || 'צבע גופן',
    highlight: t('editor.highlight') || 'הדגשת רקע',
    addRowBefore: t('editor.addRowBefore') || 'הוסף שורה מעל',
    addRowAfter: t('editor.addRowAfter') || 'הוסף שורה מתחת',
    deleteRow: t('editor.deleteRow') || 'מחק שורה',
    addColumnBefore: t('editor.addColumnBefore') || 'הוסף עמודה לפני',
    addColumnAfter: t('editor.addColumnAfter') || 'הוסף עמודה אחרי',
    deleteColumn: t('editor.deleteColumn') || 'מחק עמודה',
    deleteTable: t('editor.deleteTable') || 'מחק טבלה',
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 rounded-t-md",
      direction === 'rtl' && "flex-row-reverse"
    )}>
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('bold') && "bg-accent")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title={toolbarTranslations.bold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('italic') && "bg-accent")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title={toolbarTranslations.italic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('underline') && "bg-accent")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title={toolbarTranslations.underline}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('strike') && "bg-accent")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title={toolbarTranslations.strikethrough}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={toolbarTranslations.textColor}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-5 gap-1">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className={cn(
                  "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                  !color.value && "bg-foreground"
                )}
                style={{ backgroundColor: color.value || undefined }}
                onClick={() => {
                  if (color.value) {
                    editor.chain().focus().setColor(color.value).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
                title={color.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlight */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={toolbarTranslations.highlight}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className={cn(
                  "w-6 h-6 rounded border border-border hover:scale-110 transition-transform",
                  !color.value && "bg-transparent"
                )}
                style={{ backgroundColor: color.value || undefined }}
                onClick={() => {
                  if (color.value) {
                    editor.chain().focus().toggleHighlight({ color: color.value }).run();
                  } else {
                    editor.chain().focus().unsetHighlight().run();
                  }
                }}
                title={color.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'right' }) && "bg-accent")}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title={toolbarTranslations.alignLeft}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'center' }) && "bg-accent")}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title={toolbarTranslations.alignCenter}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive({ textAlign: 'left' }) && "bg-accent")}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title={toolbarTranslations.alignRight}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-accent")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title={toolbarTranslations.bulletList}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-accent")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title={toolbarTranslations.numberedList}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Table */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", editor.isActive('table') && "bg-accent")}
            title={toolbarTranslations.insertTable}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <Plus className="h-4 w-4 mr-2" />
            {toolbarTranslations.insertTable}
          </DropdownMenuItem>
          {editor.isActive('table') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {toolbarTranslations.addRowBefore}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {toolbarTranslations.addRowAfter}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
              >
                <Minus className="h-4 w-4 mr-2" />
                {toolbarTranslations.deleteRow}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {toolbarTranslations.addColumnBefore}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {toolbarTranslations.addColumnAfter}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
              >
                <Minus className="h-4 w-4 mr-2" />
                {toolbarTranslations.deleteColumn}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {toolbarTranslations.deleteTable}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  maxLength = 5000,
  className,
}: RichTextEditorProps) {
  const { direction } = useLanguage();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: direction === 'rtl' ? 'right' : 'left',
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none',
          direction === 'rtl' && 'text-right'
        ),
        dir: direction,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html.length <= maxLength) {
        onChange(html);
      }
    },
  });

  const charCount = editor?.getText().length || 0;

  return (
    <div className={cn("border border-input rounded-md bg-background/50", className)}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground text-right">
        {charCount}/{maxLength}
      </div>
    </div>
  );
}
