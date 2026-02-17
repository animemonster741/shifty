import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { TokenRegistryTable } from '@/components/tokens/TokenRegistryTable';
import { TokenActivityLogTable } from '@/components/tokens/TokenActivityLogTable';
import { AddTokenPersonModal } from '@/components/tokens/AddTokenPersonModal';
import { EditTokenPersonModal } from '@/components/tokens/EditTokenPersonModal';
import { AddTokenActivityModal } from '@/components/tokens/AddTokenActivityModal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export interface TokenPerson {
  id: string;
  full_name: string;
  id_number: string;
  company: string;
  phone_number: string;
  token_type: string;
  created_at: string;
}

export interface TokenActivity {
  id: string;
  requestor_id: string;
  operator_id: string;
  action_type: string;
  created_at: string;
  // Joined data
  requestor?: TokenPerson;
  operator_name?: string;
}

export function TokensTab() {
  const { user, isAdmin } = useAuth();
  const { t, direction } = useLanguage();
  const [people, setPeople] = useState<TokenPerson[]>([]);
  const [activities, setActivities] = useState<TokenActivity[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<TokenPerson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [registryRes, activityRes, profilesRes] = await Promise.all([
        supabase.from('tokens_registry').select('*').order('created_at', { ascending: false }),
        supabase.from('token_activity_log').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name'),
      ]);

      if (registryRes.data) setPeople(registryRes.data);
      if (activityRes.data) {
        // Join activity with registry data
        const enriched = activityRes.data.map((act: any) => ({
          ...act,
          requestor: registryRes.data?.find((p: TokenPerson) => p.id === act.requestor_id),
          operator_name: profilesRes.data?.find((p: any) => p.id === act.operator_id)?.full_name || '',
        }));
        setActivities(enriched);
      }
      if (profilesRes.data) setProfiles(profilesRes.data);
    } catch (error) {
      console.error('Error fetching tokens data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPerson = async (data: Omit<TokenPerson, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('tokens_registry').insert({
      ...data,
      created_by: user?.id,
    });
    if (error) {
      toast.error(direction === 'rtl' ? 'שגיאה בהוספת רשומה' : 'Error adding record');
      return;
    }
    toast.success(direction === 'rtl' ? 'הרשומה נוספה בהצלחה' : 'Record added successfully');
    setIsAddPersonOpen(false);
    fetchData();
  };

  const handleEditPerson = async (id: string, data: Omit<TokenPerson, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('tokens_registry').update(data).eq('id', id);
    if (error) {
      toast.error(direction === 'rtl' ? 'שגיאה בעדכון רשומה' : 'Error updating record');
      return;
    }
    toast.success(direction === 'rtl' ? 'הרשומה עודכנה בהצלחה' : 'Record updated successfully');
    setIsEditPersonOpen(false);
    setEditingPerson(null);
    fetchData();
  };

  const handleDeletePerson = async (id: string) => {
    const { error } = await supabase.from('tokens_registry').delete().eq('id', id);
    if (error) {
      toast.error(direction === 'rtl' ? 'שגיאה במחיקת רשומה' : 'Error deleting record');
      return;
    }
    toast.success(direction === 'rtl' ? 'הרשומה נמחקה בהצלחה' : 'Record deleted successfully');
    fetchData();
  };

  const handleAddActivity = async (data: { requestor_id: string; operator_id: string; action_type: string }) => {
    const { error } = await supabase.from('token_activity_log').insert({
      ...data,
      created_by: user?.id,
    });
    if (error) {
      toast.error(direction === 'rtl' ? 'שגיאה בהוספת פעולה' : 'Error adding activity');
      return;
    }
    toast.success(direction === 'rtl' ? 'הפעולה נוספה בהצלחה' : 'Activity added successfully');
    setIsAddActivityOpen(false);
    fetchData();
  };

  const handleDeleteActivity = async (id: string) => {
    const { error } = await supabase.from('token_activity_log').delete().eq('id', id);
    if (error) {
      toast.error(direction === 'rtl' ? 'שגיאה במחיקת פעולה' : 'Error deleting activity');
      return;
    }
    toast.success(direction === 'rtl' ? 'הפעולה נמחקה בהצלחה' : 'Activity deleted successfully');
    fetchData();
  };

  return (
    <div className="space-y-8 animate-fade-in" dir={direction}>
      {/* Token Registry Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {direction === 'rtl' ? 'רישום טוקנים' : 'Token Registry'}
          </h2>
          {isAdmin && (
            <Button onClick={() => setIsAddPersonOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              {direction === 'rtl' ? 'הוספת איש' : 'Add Person'}
            </Button>
          )}
        </div>
        <TokenRegistryTable
          people={people}
          isAdmin={isAdmin}
          onEdit={(person) => { setEditingPerson(person); setIsEditPersonOpen(true); }}
          onDelete={handleDeletePerson}
          isLoading={isLoading}
        />
      </section>

      <Separator />

      {/* Activity Log Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {direction === 'rtl' ? 'יומן פעולות טוקנים' : 'Token Activity Log'}
          </h2>
          <Button onClick={() => setIsAddActivityOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {direction === 'rtl' ? 'הוספת פעולה' : 'Add Activity'}
          </Button>
        </div>
        <TokenActivityLogTable
          activities={activities}
          isAdmin={isAdmin}
          onDelete={handleDeleteActivity}
          isLoading={isLoading}
        />
      </section>

      {/* Modals */}
      <AddTokenPersonModal
        open={isAddPersonOpen}
        onOpenChange={setIsAddPersonOpen}
        onSubmit={handleAddPerson}
      />
      {editingPerson && (
        <EditTokenPersonModal
          open={isEditPersonOpen}
          onOpenChange={(open) => { setIsEditPersonOpen(open); if (!open) setEditingPerson(null); }}
          person={editingPerson}
          onSubmit={(data) => handleEditPerson(editingPerson.id, data)}
        />
      )}
      <AddTokenActivityModal
        open={isAddActivityOpen}
        onOpenChange={setIsAddActivityOpen}
        people={people}
        profiles={profiles}
        onSubmit={handleAddActivity}
      />
    </div>
  );
}
