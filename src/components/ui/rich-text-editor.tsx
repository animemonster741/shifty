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
  RowsIcon,
  Columns,
  PaintBucket,
  ToggleLeft,
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

const CELL_COLORS = [
  { name: 'None', value: '' },
  { name: 'Red', value: 'rgba(239, 68, 68, 0.2)' },
  { name: 'Orange', value: 'rgba(249, 115, 22, 0.2)' },
  { name: 'Yellow', value: 'rgba(234, 179, 8, 0.2)' },
  { name: 'Green', value: 'rgba(34, 197, 94, 0.2)' },
  { name: 'Blue', value: 'rgba(59, 130, 246, 0.2)' },
  { name: 'Purple', value: 'rgba(168, 85, 247, 0.2)' },
  { name: 'Cyan', value: 'rgba(6, 182, 212, 0.2)' },
];

function TableToolbar({ editor }: { editor: Editor }) {
  const { t, direction } = useLanguage();

  const tableTranslations = {
    addRowBefore: t('editor.addRowBefore') || 'הוסף שורה מעל',
    addRowAfter: t('editor.addRowAfter') || 'הוסף שורה מתחת',
    deleteRow: t('editor.deleteRow') || 'מחק שורה',
    addColumnBefore: t('editor.addColumnBefore') || 'הוסף עמודה לפני',
    addColumnAfter: t('editor.addColumnAfter') || 'הוסף עמודה אחרי',
    deleteColumn: t('editor.deleteColumn') || 'מחק עמודה',
    deleteTable: t('editor.deleteTable') || 'מחק טבלה',
    toggleHeaderRow: t('editor.toggleHeaderRow') || 'שורת כותרת',
    cellColor: t('editor.cellColor') || 'צבע תא',
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 p-2 bg-slate-800/80 border-b border-cyan-500/30 rounded-t-sm",
      direction === 'rtl' && "flex-row-reverse"
    )}>
      <span className="text-xs text-cyan-400 font-medium px-2">טבלה:</span>
      
      {/* Row Controls */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-cyan-400 hover:bg-slate-700"
          onClick={() => editor.chain().focus().addRowBefore().run()}
          title={tableTranslations.addRowBefore}
        >
          <Plus className="h-3 w-3" />
          <RowsIcon className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-cyan-400 hover:bg-slate-700"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          title={tableTranslations.addRowAfter}
        >
          <RowsIcon className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:bg-destructive/20"
          onClick={() => editor.chain().focus().deleteRow().run()}
          title={tableTranslations.deleteRow}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Column Controls */}
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-cyan-400 hover:bg-slate-700"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          title={tableTranslations.addColumnBefore}
        >
          <Plus className="h-3 w-3" />
          <Columns className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-cyan-400 hover:bg-slate-700"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          title={tableTranslations.addColumnAfter}
        >
          <Columns className="h-3 w-3" />
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:bg-destructive/20"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          title={tableTranslations.deleteColumn}
        >
          <Minus className="h-3 w-3" />
        </Button>
      </div>

      <div className="w-px h-5 bg-slate-600 mx-1" />

      {/* Header Toggle */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground hover:text-cyan-400 hover:bg-slate-700 gap-1"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        title={tableTranslations.toggleHeaderRow}
      >
        <ToggleLeft className="h-3 w-3" />
        {tableTranslations.toggleHeaderRow}
      </Button>

      {/* Cell Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-cyan-400 hover:bg-slate-700 gap-1"
            title={tableTranslations.cellColor}
          >
            <PaintBucket className="h-3 w-3" />
            {tableTranslations.cellColor}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 bg-slate-800 border-slate-600" align="start">
          <div className="grid grid-cols-4 gap-1">
            {CELL_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                className={cn(
                  "w-6 h-6 rounded border border-slate-500 hover:scale-110 transition-transform",
                  !color.value && "bg-transparent border-dashed"
                )}
                style={{ backgroundColor: color.value || undefined }}
                onClick={() => {
                  if (color.value) {
                    editor.chain().focus().setCellAttribute('backgroundColor', color.value).run();
                  } else {
                    editor.chain().focus().setCellAttribute('backgroundColor', '').run();
                  }
                }}
                title={color.name}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1" />

      {/* Delete Table */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-destructive hover:bg-destructive/20 gap-1"
        onClick={() => editor.chain().focus().deleteTable().run()}
        title={tableTranslations.deleteTable}
      >
        <Trash2 className="h-3 w-3" />
        {tableTranslations.deleteTable}
      </Button>
    </div>
  );
}

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

      {/* Table Insert */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive('table') && "bg-accent text-cyan-400")}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title={toolbarTranslations.insertTable}
      >
        <TableIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'הקלד את ההודעה שלך...',
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
        HTMLAttributes: {
          class: 'rich-text-table',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'rich-text-cell',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'rich-text-header',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none bg-slate-800/50 rounded-b-md',
          direction === 'rtl' && 'text-right',
          'rich-text-editor-content'
        ),
        dir: direction,
        'data-placeholder': placeholder,
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
  const isTableActive = editor?.isActive('table') || false;

  return (
    <div className={cn("border border-slate-600 rounded-md bg-slate-900/80 overflow-hidden", className)}>
      <EditorToolbar editor={editor} />
      {isTableActive && editor && <TableToolbar editor={editor} />}
      <EditorContent editor={editor} />
      <div className="px-4 py-2 border-t border-slate-700 text-xs text-muted-foreground text-right bg-slate-900/50">
        {charCount}/{maxLength}
      </div>
    </div>
  );
}
