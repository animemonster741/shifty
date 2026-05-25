import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Room, AccessApprover, REASON_OPTIONS } from '@/pages/tabs/RoomAccessTab';

interface AddRoomAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  approvers: AccessApprover[];
  onSuccess: () => void;
}

export function AddRoomAccessModal({ open, onOpenChange, rooms, approvers, onSuccess }: AddRoomAccessModalProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const he = language === 'he';

  const [personnel, setPersonnel] = useState<string[]>([]);
  const [personInput, setPersonInput] = useState('');
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [approverId, setApproverId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setPersonnel([]);
    setPersonInput('');
    setSelectedRoomIds([]);
    setReason('');
    setStartDate(undefined);
    setStartTime('08:00');
    setEndDate(undefined);
    setEndTime('17:00');
    setApproverId('');
    setNotes('');
  };

  const addPerson = () => {
    const name = personInput.trim();
    if (name && !personnel.includes(name)) {
      setPersonnel(prev => [...prev, name]);
      setPersonInput('');
    }
  };

  const removePerson = (name: string) => {
    setPersonnel(prev => prev.filter(p => p !== name));
  };

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const combineDateTime = (date: Date | undefined, time: string): string | null => {
    if (!date) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  };

  const isValid = personnel.length > 0 && selectedRoomIds.length > 0 && reason && startDate && endDate && approverId;

  const handleSubmit = async () => {
    if (!isValid) return;

    const startDateTime = combineDateTime(startDate, startTime);
    const endDateTime = combineDateTime(endDate, endTime);

    if (!startDateTime || !endDateTime) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('room_access_entries').insert({
        authorized_personnel: personnel,
        room_ids: selectedRoomIds,
        reason,
        start_date: startDateTime,
        end_date: endDateTime,
        approver_id: approverId,
        notes: notes.trim() || null,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success(he ? 'הרשומה נוספה בהצלחה' : 'Entry added successfully');
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error(he ? 'שגיאה בהוספת הרשומה' : 'Error adding entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{he ? 'הוספת רשומת כניסה' : 'Add Access Entry'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Authorized Personnel */}
          <div className="space-y-2">
            <Label>{he ? 'אנשים מורשים *' : 'Authorized Personnel *'}</Label>
            <div className="flex gap-2">
              <Input
                value={personInput}
                onChange={(e) => setPersonInput(e.target.value)}
                placeholder={he ? 'הזן שם...' : 'Enter name...'}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerson(); } }}
                className="flex-1"
              />
              <Button type="button" size="icon" variant="outline" onClick={addPerson} disabled={!personInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {personnel.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {personnel.map((p) => (
                  <Badge key={p} variant="secondary" className="gap-1 pe-1">
                    {p}
                    <button onClick={() => removePerson(p)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Room Selection */}
          <div className="space-y-2">
            <Label>{he ? 'בחירת אולמות *' : 'Select Rooms *'}</Label>
            <div className="grid grid-cols-2 gap-2">
              {rooms.map((room) => (
                <label
                  key={room.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedRoomIds.includes(room.id)}
                    onCheckedChange={() => toggleRoom(room.id)}
                  />
                  <span className="text-sm">{room.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>{he ? 'סיבת כניסה *' : 'Reason for Entry *'}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={he ? 'בחר סיבה...' : 'Select reason...'} />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {he ? opt.label_he : opt.label_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>{he ? 'מתאריך *' : 'Start Date *'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-start font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : (he ? 'בחר תאריך' : 'Pick date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>{he ? 'עד תאריך *' : 'End Date *'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-start font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="me-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : (he ? 'בחר תאריך' : 'Pick date')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Approving Authority */}
          <div className="space-y-2">
            <Label>{he ? 'גורם מאשר *' : 'Approving Authority *'}</Label>
            {approvers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{he ? 'אין גורמים מאשרים. הוסף אותם בפאנל הניהול.' : 'No approvers yet. Add them in the Admin panel.'}</p>
            ) : (
              <Select value={approverId} onValueChange={setApproverId}>
                <SelectTrigger>
                  <SelectValue placeholder={he ? 'בחר גורם מאשר...' : 'Select approver...'} />
                </SelectTrigger>
                <SelectContent>
                  {approvers.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{he ? 'הערות' : 'Notes'}</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={he ? 'הערות (אופציונלי)...' : 'Notes (optional)...'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { resetForm(); onOpenChange(false); }}>
            {he ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
            {he ? 'הוספה' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
