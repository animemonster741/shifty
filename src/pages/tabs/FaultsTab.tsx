import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Archive, ArchiveRestore, Loader2, Plus, Pencil, Trash2, Wrench, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FaultType = 'hardware' | 'software';
type FaultStatus = 'open_external' | 'closed' | 'frozen';

interface SystemFault {
  id: string;
  fault_time: string;
  operator_id: string | null;
  operator_name: string;
  network: string;
  vendor: string;
  controller_name: string;
  controller_location: string;
  fault_type: FaultType;
  fault_description: string;
  status: FaultStatus;
  notes: string | null;
  created_by: string | null;
  modified_by: string | null;
  modified_time: string | null;
  created_at: string;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: string | null;
}

interface Profile {
  id: string;
  full_name: string;
}

const VENDORS = ['EMC', 'NETAPP', 'IBM/XIV'];
const NETWORKS = Array.from({ length: 10 }, (_, i) => String(i + 1));

const LOCATIONS: { value: string; he: string; en: string }[] = [
  { value: 'aviv', he: 'אביב', en: 'Aviv' },
  { value: 'petel', he: 'פטל', en: 'Petel' },
  { value: 'metzuda', he: 'מצודה', en: 'Metzuda' },
  { value: 'tevat_noach', he: 'תיבת נוח', en: 'Tevat Noach' },
  { value: 'other', he: 'אחר', en: 'Other' },
];

const STATUSES: { value: FaultStatus; he: string; en: string; tone: string }[] = [
  { value: 'open_external', he: 'פתוחה - טיפול חיצוני', en: 'Open - External Handling', tone: 'bg-warning/15 text-warning border-warning/30' },
  { value: 'closed', he: 'סגורה', en: 'Closed', tone: 'bg-success/15 text-success border-success/30' },
  { value: 'frozen', he: 'מוקפא', en: 'Frozen', tone: 'bg-muted text-muted-foreground border-border' },
];

const FAULT_TYPES: { value: FaultType; he: string; en: string }[] = [
  { value: 'hardware', he: 'חומרה', en: 'Hardware' },
  { value: 'software', he: 'תוכנה', en: 'Software' },
];

const tt = (language: string, he: string, en: string) => (language === 'he' ? he : en);

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface FormState {
  fault_time: string;
  operator_id: string;
  network: string;
  vendor: string;
  controller_name: string;
  controller_location: string;
  fault_type: FaultType;
  fault_description: string;
  status: FaultStatus;
  notes: string;
}

const emptyForm = (): FormState => ({
  fault_time: toLocalInput(new Date()),
  operator_id: '',
  network: '',
  vendor: '',
  controller_name: '',
  controller_location: '',
  fault_type: 'hardware',
  fault_description: '',
  status: 'open_external',
  notes: '',
});

export function FaultsTab() {
  const { user, isAdmin } = useAuth();
  const { language, direction } = useLanguage();

  const [faults, setFaults] = useState<SystemFault[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'archive'>('active');

  const fetchAll = async () => {
    setLoading(true);
    const [f, p] = await Promise.all([
      (supabase as any).from('system_faults').select('*').order('fault_time', { ascending: false }),
      supabase.from('profiles').select('id, full_name').order('full_name'),
    ]);
    if (f.error) toast.error(f.error.message);
    else setFaults(f.data || []);
    if (!p.error) setProfiles((p.data as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const ch = supabase
      .channel('system_faults_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_faults' }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const profileMap = useMemo(() => {
    const m = new Map<string, string>();
    profiles.forEach(p => m.set(p.id, p.full_name));
    if (user) m.set(user.id, user.fullName);
    return m;
  }, [profiles, user]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), operator_id: user?.id ?? '' });
    setShowForm(true);
  };

  const openEdit = (f: SystemFault) => {
    setEditingId(f.id);
    setForm({
      fault_time: toLocalInput(new Date(f.fault_time)),
      operator_id: f.operator_id ?? '',
      network: f.network,
      vendor: f.vendor,
      controller_name: f.controller_name,
      controller_location: f.controller_location,
      fault_type: f.fault_type,
      fault_description: f.fault_description,
      status: f.status,
      notes: f.notes ?? '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const validate = (): string | null => {
    if (!form.fault_time) return tt(language, 'יש לבחור תאריך ושעה', 'Date and time are required');
    if (!form.operator_id) return tt(language, 'יש לבחור מפעיל', 'Operator is required');
    if (!form.network) return tt(language, 'יש לבחור רשת', 'Network is required');
    if (!form.vendor) return tt(language, 'יש לבחור יצרן', 'Vendor is required');
    if (!form.controller_name.trim()) return tt(language, 'יש להזין שם בקר', 'Controller name is required');
    if (form.controller_name.length > 200) return tt(language, 'שם בקר ארוך מדי', 'Controller name too long');
    if (!form.controller_location) return tt(language, 'יש לבחור מיקום בקר', 'Controller location is required');
    if (!form.fault_description.trim()) return tt(language, 'יש להזין תיאור תקלה', 'Fault description is required');
    if (form.fault_description.length > 5000) return tt(language, 'תיאור התקלה ארוך מדי', 'Fault description too long');
    if (form.notes.length > 5000) return tt(language, 'הערות ארוכות מדי', 'Notes too long');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    if (!user) { toast.error(tt(language, 'נדרשת התחברות', 'Authentication required')); return; }

    setSubmitting(true);
    const operatorName = profileMap.get(form.operator_id) || user.fullName;
    const payload = {
      fault_time: new Date(form.fault_time).toISOString(),
      operator_id: form.operator_id,
      operator_name: operatorName,
      network: form.network,
      vendor: form.vendor,
      controller_name: form.controller_name.trim(),
      controller_location: form.controller_location,
      fault_type: form.fault_type,
      fault_description: form.fault_description.trim(),
      status: form.status,
      notes: form.notes.trim() || null,
    };

    let res;
    if (editingId) {
      res = await (supabase as any)
        .from('system_faults')
        .update({ ...payload, modified_by: user.id, modified_time: new Date().toISOString() })
        .eq('id', editingId);
    } else {
      res = await (supabase as any)
        .from('system_faults')
        .insert({ ...payload, created_by: user.id });
    }
    setSubmitting(false);

    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editingId
      ? tt(language, 'התקלה עודכנה', 'Fault updated')
      : tt(language, 'התקלה נוספה', 'Fault created'));
    closeForm();
    fetchAll();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await (supabase as any).from('system_faults').delete().eq('id', deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success(tt(language, 'התקלה נמחקה', 'Fault deleted'));
      fetchAll();
    }
    setDeleteId(null);
  };

  const handleArchive = async (f: SystemFault) => {
    if (!user) return;
    const archiving = !f.is_archived;
    const { error } = await (supabase as any)
      .from('system_faults')
      .update({
        is_archived: archiving,
        archived_at: archiving ? new Date().toISOString() : null,
        archived_by: archiving ? user.id : null,
      })
      .eq('id', f.id);
    if (error) toast.error(error.message);
    else {
      toast.success(archiving
        ? tt(language, 'הועבר לארכיון', 'Moved to archive')
        : tt(language, 'שוחזר מהארכיון', 'Restored from archive'));
      fetchAll();
    }
  };

  const visibleFaults = useMemo(
    () => faults.filter(f => (view === 'archive' ? f.is_archived : !f.is_archived)),
    [faults, view]
  );

  const locLabel = (v: string) => {
    const l = LOCATIONS.find(x => x.value === v);
    return l ? tt(language, l.he, l.en) : v;
  };
  const statusLabel = (v: FaultStatus) => {
    const s = STATUSES.find(x => x.value === v)!;
    return tt(language, s.he, s.en);
  };
  const statusTone = (v: FaultStatus) => STATUSES.find(x => x.value === v)?.tone ?? '';
  const typeLabel = (v: FaultType) => {
    const t = FAULT_TYPES.find(x => x.value === v)!;
    return tt(language, t.he, t.en);
  };

  return (
    <div className="space-y-6" dir={direction}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            {tt(language, 'ניהול תקלות מערכת', 'System Faults')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tt(language, 'תיעוד וניהול תקלות חומרה ותוכנה בבקרי האחסון',
              'Log and manage hardware and software faults on storage controllers')}
          </p>
        </div>
        {!showForm && (
          <Button onClick={openNew} variant="glow">
            <Plus className="h-4 w-4" />
            {tt(language, 'דיווח תקלה', 'Log Fault')}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId
                ? tt(language, 'עריכת תקלה', 'Edit Fault')
                : tt(language, 'תקלה חדשה', 'New Fault')}
            </CardTitle>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fault_time">{tt(language, 'תאריך ושעה', 'Date & Time')} *</Label>
                  <Input
                    id="fault_time"
                    type="datetime-local"
                    value={form.fault_time}
                    onChange={(e) => setForm(f => ({ ...f, fault_time: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{tt(language, 'שם המפעיל', 'Operator Name')} *</Label>
                  <Select value={form.operator_id} onValueChange={(v) => setForm(f => ({ ...f, operator_id: v }))}>
                    <SelectTrigger><SelectValue placeholder={tt(language, 'בחר מפעיל', 'Select operator')} /></SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{tt(language, 'רשת', 'Network')} *</Label>
                  <Select value={form.network} onValueChange={(v) => setForm(f => ({ ...f, network: v }))}>
                    <SelectTrigger><SelectValue placeholder={tt(language, 'בחר רשת', 'Select network')} /></SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map(n => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{tt(language, 'יצרן', 'Company / Vendor')} *</Label>
                  <Select value={form.vendor} onValueChange={(v) => setForm(f => ({ ...f, vendor: v }))}>
                    <SelectTrigger><SelectValue placeholder={tt(language, 'בחר יצרן', 'Select vendor')} /></SelectTrigger>
                    <SelectContent>
                      {VENDORS.map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="controller_name">{tt(language, 'שם הבקר', 'Controller Name')} *</Label>
                  <Input
                    id="controller_name"
                    value={form.controller_name}
                    maxLength={200}
                    onChange={(e) => setForm(f => ({ ...f, controller_name: e.target.value }))}
                    placeholder={tt(language, 'לדוגמה: CTRL-01', 'e.g. CTRL-01')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{tt(language, 'מיקום הבקר', 'Controller Location')} *</Label>
                  <Select value={form.controller_location} onValueChange={(v) => setForm(f => ({ ...f, controller_location: v }))}>
                    <SelectTrigger><SelectValue placeholder={tt(language, 'בחר מיקום', 'Select location')} /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map(l => (
                        <SelectItem key={l.value} value={l.value}>{tt(language, l.he, l.en)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{tt(language, 'סוג התקלה', 'Fault Type')} *</Label>
                  <RadioGroup
                    value={form.fault_type}
                    onValueChange={(v) => setForm(f => ({ ...f, fault_type: v as FaultType }))}
                    className="flex gap-6 pt-2"
                  >
                    {FAULT_TYPES.map(ft => (
                      <div key={ft.value} className="flex items-center gap-2">
                        <RadioGroupItem value={ft.value} id={`ft-${ft.value}`} />
                        <Label htmlFor={`ft-${ft.value}`} className="cursor-pointer font-normal">
                          {tt(language, ft.he, ft.en)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>{tt(language, 'סטטוס', 'Status')} *</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as FaultStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{tt(language, s.he, s.en)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fault_description">{tt(language, 'תיאור התקלה', 'Fault Description')} *</Label>
                <Textarea
                  id="fault_description"
                  value={form.fault_description}
                  maxLength={5000}
                  rows={4}
                  onChange={(e) => setForm(f => ({ ...f, fault_description: e.target.value }))}
                  placeholder={tt(language, 'תיאור מפורט של התקלה...', 'Detailed description of the fault...')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{tt(language, 'הערות', 'Notes')}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  maxLength={5000}
                  rows={3}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={tt(language, 'הערות נוספות...', 'Additional remarks...')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={closeForm} disabled={submitting}>
                  {tt(language, 'ביטול', 'Cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {tt(language, 'שמירה', 'Submit')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {tt(language, 'תקלות מתועדות', 'Logged Faults')} ({faults.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : faults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {tt(language, 'אין תקלות מתועדות', 'No faults logged yet')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tt(language, 'תאריך', 'Date')}</TableHead>
                    <TableHead>{tt(language, 'מפעיל', 'Operator')}</TableHead>
                    <TableHead>{tt(language, 'רשת', 'Network')}</TableHead>
                    <TableHead>{tt(language, 'יצרן', 'Vendor')}</TableHead>
                    <TableHead>{tt(language, 'בקר', 'Controller')}</TableHead>
                    <TableHead>{tt(language, 'מיקום', 'Location')}</TableHead>
                    <TableHead>{tt(language, 'סוג', 'Type')}</TableHead>
                    <TableHead>{tt(language, 'סטטוס', 'Status')}</TableHead>
                    <TableHead className="text-end">{tt(language, 'פעולות', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faults.map(f => (
                    <TableRow key={f.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(f.fault_time), 'yyyy-MM-dd HH:mm')}
                      </TableCell>
                      <TableCell>{f.operator_name}</TableCell>
                      <TableCell>{f.network}</TableCell>
                      <TableCell>{f.vendor}</TableCell>
                      <TableCell className="font-medium">{f.controller_name}</TableCell>
                      <TableCell>{locLabel(f.controller_location)}</TableCell>
                      <TableCell>{typeLabel(f.fault_type)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusTone(f.status)}>
                          {statusLabel(f.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(f)} title={tt(language, 'עריכה', 'Edit')}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button size="icon" variant="ghost" onClick={() => setDeleteId(f.id)} title={tt(language, 'מחיקה', 'Delete')}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent dir={direction}>
          <AlertDialogHeader>
            <AlertDialogTitle>{tt(language, 'מחיקת תקלה', 'Delete fault')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tt(language,
                'פעולה זו אינה הפיכה. האם להמשיך?',
                'This action cannot be undone. Continue?')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tt(language, 'ביטול', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {tt(language, 'מחיקה', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
