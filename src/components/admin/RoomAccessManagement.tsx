import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil, Trash2, Check, X, DoorOpen, UserCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Room {
  id: string;
  name: string;
  display_order: number;
}

interface Approver {
  id: string;
  name: string;
}

export function RoomAccessManagement() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const he = language === 'he';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingApprovers, setIsLoadingApprovers] = useState(true);

  // Room form
  const [newRoomName, setNewRoomName] = useState('');
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');

  // Approver form
  const [newApproverName, setNewApproverName] = useState('');
  const [isAddingApprover, setIsAddingApprover] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchApprovers();
  }, []);

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const { data, error } = await supabase.from('rooms').select('*').order('display_order');
      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchApprovers = async () => {
    setIsLoadingApprovers(true);
    try {
      const { data, error } = await supabase.from('access_approvers').select('*').order('name');
      if (error) throw error;
      setApprovers(data || []);
    } catch (error) {
      console.error('Error fetching approvers:', error);
    } finally {
      setIsLoadingApprovers(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsAddingRoom(true);
    try {
      const maxOrder = rooms.length > 0 ? Math.max(...rooms.map(r => r.display_order)) : 0;
      const { error } = await supabase.from('rooms').insert({
        name: newRoomName.trim(),
        display_order: maxOrder + 1,
        created_by: user?.id,
      });
      if (error) throw error;
      toast.success(he ? 'האולם נוסף בהצלחה' : 'Room added successfully');
      setNewRoomName('');
      fetchRooms();
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error(he ? 'שגיאה בהוספת האולם' : 'Error adding room');
    } finally {
      setIsAddingRoom(false);
    }
  };

  const handleUpdateRoom = async (roomId: string) => {
    if (!editingRoomName.trim()) { setEditingRoomId(null); return; }
    try {
      const { error } = await supabase.from('rooms').update({ name: editingRoomName.trim() }).eq('id', roomId);
      if (error) throw error;
      toast.success(he ? 'האולם עודכן' : 'Room updated');
      setEditingRoomId(null);
      setEditingRoomName('');
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error(he ? 'שגיאה בעדכון' : 'Error updating');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
      toast.success(he ? 'האולם נמחק' : 'Room deleted');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(he ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  const handleAddApprover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApproverName.trim()) return;
    setIsAddingApprover(true);
    try {
      const { error } = await supabase.from('access_approvers').insert({
        name: newApproverName.trim(),
        created_by: user?.id,
      });
      if (error) throw error;
      toast.success(he ? 'הגורם המאשר נוסף' : 'Approver added');
      setNewApproverName('');
      fetchApprovers();
    } catch (error) {
      console.error('Error adding approver:', error);
      toast.error(he ? 'שגיאה בהוספה' : 'Error adding');
    } finally {
      setIsAddingApprover(false);
    }
  };

  const handleDeleteApprover = async (id: string) => {
    try {
      const { error } = await supabase.from('access_approvers').delete().eq('id', id);
      if (error) throw error;
      toast.success(he ? 'הגורם המאשר הוסר' : 'Approver removed');
      fetchApprovers();
    } catch (error) {
      console.error('Error deleting approver:', error);
      toast.error(he ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Rooms Management */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            {he ? 'ניהול אולמות' : 'Manage Rooms'}
          </CardTitle>
          <CardDescription>{he ? 'הוספה, עריכה ומחיקה של אולמות' : 'Add, edit and delete rooms'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddRoom} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>{he ? 'שם האולם' : 'Room Name'}</Label>
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder={he ? 'הזן שם אולם...' : 'Enter room name...'}
                className="input-noc"
              />
            </div>
            <Button type="submit" variant="glow" disabled={isAddingRoom || !newRoomName.trim()}>
              {isAddingRoom ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Plus className="h-4 w-4 me-2" />}
              {he ? 'הוספה' : 'Add'}
            </Button>
          </form>

          {isLoadingRooms ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : rooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">{he ? 'אין אולמות' : 'No rooms'}</p>
          ) : (
            <div className="grid gap-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    <DoorOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    {editingRoomId === room.id ? (
                      <Input
                        value={editingRoomName}
                        onChange={(e) => setEditingRoomName(e.target.value)}
                        className="input-noc flex-1 max-w-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateRoom(room.id);
                          if (e.key === 'Escape') { setEditingRoomId(null); setEditingRoomName(''); }
                        }}
                      />
                    ) : (
                      <span className="font-medium">{room.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingRoomId === room.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateRoom(room.id)}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingRoomId(null); setEditingRoomName(''); }}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingRoomId(room.id); setEditingRoomName(room.name); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{he ? 'מחיקת אולם' : 'Delete Room'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {he ? `האם למחוק את "${room.name}"?` : `Delete "${room.name}"?`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{he ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>{he ? 'מחיקה' : 'Delete'}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approvers Management */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {he ? 'ניהול גורמים מאשרים' : 'Manage Approvers'}
          </CardTitle>
          <CardDescription>{he ? 'הוספה והסרה של גורמים מאשרים' : 'Add and remove approving authorities'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddApprover} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>{he ? 'שם הגורם המאשר' : 'Approver Name'}</Label>
              <Input
                value={newApproverName}
                onChange={(e) => setNewApproverName(e.target.value)}
                placeholder={he ? 'הזן שם...' : 'Enter name...'}
                className="input-noc"
              />
            </div>
            <Button type="submit" variant="glow" disabled={isAddingApprover || !newApproverName.trim()}>
              {isAddingApprover ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : <Plus className="h-4 w-4 me-2" />}
              {he ? 'הוספה' : 'Add'}
            </Button>
          </form>

          {isLoadingApprovers ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : approvers.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">{he ? 'אין גורמים מאשרים' : 'No approvers'}</p>
          ) : (
            <div className="grid gap-2">
              {approvers.map((approver) => (
                <div key={approver.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{approver.name}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{he ? 'הסרת גורם מאשר' : 'Remove Approver'}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {he ? `האם להסיר את "${approver.name}"?` : `Remove "${approver.name}"?`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{he ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteApprover(approver.id)}>{he ? 'הסרה' : 'Remove'}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
