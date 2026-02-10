import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { KeyRound, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { AddRoomAccessModal } from '@/components/room-access/AddRoomAccessModal';

export interface Room {
  id: string;
  name: string;
  display_order: number;
}

export interface AccessApprover {
  id: string;
  name: string;
}

export interface RoomAccessEntry {
  id: string;
  authorized_personnel: string[];
  room_ids: string[];
  reason: string;
  start_date: string;
  end_date: string;
  approver_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

const REASON_OPTIONS = [
  { value: 'תקלה', label_he: 'תקלה', label_en: 'Malfunction' },
  { value: 'התעצמות', label_he: 'התעצמות', label_en: 'Amplification' },
  { value: 'אחזקה כללית', label_he: 'אחזקה כללית', label_en: 'General Maintenance' },
  { value: 'ביקורת', label_he: 'ביקורת', label_en: 'Inspection' },
  { value: 'בדיקת מיזוג', label_he: 'בדיקת מיזוג', label_en: 'AC Check' },
  { value: 'בדיקת חשמל', label_he: 'בדיקת חשמל', label_en: 'Electrical Check' },
  { value: 'התקנת ציוד או רכיבים', label_he: 'התקנת ציוד או רכיבים', label_en: 'Equipment Installation' },
  { value: 'עבודה שוטפת', label_he: 'עבודה שוטפת', label_en: 'Routine Work' },
  { value: 'פק"מ', label_he: 'פק"מ', label_en: 'PKM' },
  { value: 'אחר', label_he: 'אחר', label_en: 'Other' },
];

export { REASON_OPTIONS };

export function RoomAccessTab() {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const [entries, setEntries] = useState<RoomAccessEntry[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [approvers, setApprovers] = useState<AccessApprover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [entriesRes, roomsRes, approversRes] = await Promise.all([
        supabase.from('room_access_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*').order('display_order'),
        supabase.from('access_approvers').select('*').order('name'),
      ]);

      if (entriesRes.error) throw entriesRes.error;
      if (roomsRes.error) throw roomsRes.error;
      if (approversRes.error) throw approversRes.error;

      setEntries(entriesRes.data || []);
      setRooms(roomsRes.data || []);
      setApprovers(approversRes.data || []);
    } catch (error) {
      console.error('Error fetching room access data:', error);
      toast.error(language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const roomMap = useMemo(() => {
    const map: Record<string, string> = {};
    rooms.forEach(r => { map[r.id] = r.name; });
    return map;
  }, [rooms]);

  const approverMap = useMemo(() => {
    const map: Record<string, string> = {};
    approvers.forEach(a => { map[a.id] = a.name; });
    return map;
  }, [approvers]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(entry => {
      const personnel = entry.authorized_personnel.join(' ').toLowerCase();
      const roomNames = entry.room_ids.map(id => roomMap[id] || '').join(' ').toLowerCase();
      const reason = entry.reason.toLowerCase();
      const approverName = entry.approver_id ? (approverMap[entry.approver_id] || '').toLowerCase() : '';
      const notes = (entry.notes || '').toLowerCase();
      return personnel.includes(q) || roomNames.includes(q) || reason.includes(q) || approverName.includes(q) || notes.includes(q);
    });
  }, [entries, searchQuery, roomMap, approverMap]);

  const handleEntryAdded = () => {
    fetchAll();
    setIsAddModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tagColors = [
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-violet-500/20 text-violet-300 border-violet-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'bg-pink-500/20 text-pink-300 border-pink-500/30',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'he' ? 'חיפוש...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 me-2" />
          {language === 'he' ? 'הוספת כניסה' : 'Add Entry'}
        </Button>
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <KeyRound className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {language === 'he' ? 'לא נמצאו רשומות' : 'No entries found'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? (language === 'he' ? 'נסה לשנות את החיפוש' : 'Try adjusting your search')
              : (language === 'he' ? 'הוסף רשומת כניסה חדשה' : 'Add a new access entry')}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden backdrop-blur-sm bg-card/30">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/50">
                  <TableHead>{language === 'he' ? 'אנשים מורשים' : 'Authorized Personnel'}</TableHead>
                  <TableHead>{language === 'he' ? 'שמות האולמות' : 'Rooms'}</TableHead>
                  <TableHead>{language === 'he' ? 'סיבת כניסה' : 'Reason'}</TableHead>
                  <TableHead>{language === 'he' ? 'מתאריך' : 'Start Date'}</TableHead>
                  <TableHead>{language === 'he' ? 'עד תאריך' : 'End Date'}</TableHead>
                  <TableHead>{language === 'he' ? 'גורם מאשר' : 'Approver'}</TableHead>
                  <TableHead>{language === 'he' ? 'הערות' : 'Notes'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="border-b border-border/30 hover:bg-muted/20">
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {entry.authorized_personnel.map((person, i) => (
                          <Badge key={i} variant="outline" className={`text-xs ${tagColors[i % tagColors.length]}`}>
                            {person}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {entry.room_ids.map((roomId, i) => (
                          <Badge key={roomId} variant="outline" className={`text-xs ${tagColors[(i + 3) % tagColors.length]}`}>
                            {roomMap[roomId] || roomId}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{entry.reason}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(entry.start_date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(entry.end_date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.approver_id ? approverMap[entry.approver_id] || '-' : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-40 truncate">
                      {entry.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AddRoomAccessModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        rooms={rooms}
        approvers={approvers}
        onSuccess={handleEntryAdded}
      />
    </div>
  );
}
