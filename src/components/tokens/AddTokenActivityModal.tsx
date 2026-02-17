import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TokenPerson } from '@/pages/tabs/TokensTab';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ACTION_TYPES = ['מסירה', 'החזרה', 'איפוס סיסמה', 'אובדן', 'תקלה', 'אחר'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: TokenPerson[];
  profiles: { id: string; full_name: string }[];
  onSubmit: (data: { requestor_id: string; operator_id: string; action_type: string }) => void;
}

export function AddTokenActivityModal({ open, onOpenChange, people, profiles, onSubmit }: Props) {
  const { direction } = useLanguage();
  const isHe = direction === 'rtl';
  const [requestorId, setRequestorId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [actionType, setActionType] = useState('');
  const [requestorSearch, setRequestorSearch] = useState('');

  const selectedRequestor = useMemo(() => people.find(p => p.id === requestorId), [people, requestorId]);

  const filteredPeople = useMemo(() => {
    if (!requestorSearch.trim()) return people;
    const q = requestorSearch.toLowerCase();
    return people.filter(p => p.full_name.toLowerCase().includes(q));
  }, [people, requestorSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestorId || !operatorId || !actionType) return;
    onSubmit({ requestor_id: requestorId, operator_id: operatorId, action_type: actionType });
    setRequestorId('');
    setOperatorId('');
    setActionType('');
    setRequestorSearch('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setRequestorId('');
      setOperatorId('');
      setActionType('');
      setRequestorSearch('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir={direction} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isHe ? 'הוספת פעולה חדשה' : 'Add New Activity'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Requestor - searchable select */}
          <div className="space-y-2">
            <Label>{isHe ? 'שם מבקש הטוקן' : 'Requestor Name'}</Label>
            <Input
              className="input-noc mb-2"
              placeholder={isHe ? 'חיפוש לפי שם...' : 'Search by name...'}
              value={requestorSearch}
              onChange={e => setRequestorSearch(e.target.value)}
            />
            <Select value={requestorId} onValueChange={setRequestorId}>
              <SelectTrigger className="input-noc">
                <SelectValue placeholder={isHe ? 'בחר מבקש' : 'Select requestor'} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {filteredPeople.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
                {filteredPeople.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {isHe ? 'לא נמצאו תוצאות' : 'No results found'}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Auto-filled company/token type */}
          {selectedRequestor && (
            <div className="space-y-2">
              <Label>{isHe ? 'חברה / סוג טוקן' : 'Company / Token Type'}</Label>
              <div className="flex gap-2">
                <Badge variant="secondary">{selectedRequestor.company}</Badge>
                <Badge variant="outline">{selectedRequestor.token_type}</Badge>
              </div>
            </div>
          )}

          {/* Operator - from system users */}
          <div className="space-y-2">
            <Label>{isHe ? 'שם המפעיל' : 'Operator Name'}</Label>
            <Select value={operatorId} onValueChange={setOperatorId}>
              <SelectTrigger className="input-noc">
                <SelectValue placeholder={isHe ? 'בחר מפעיל' : 'Select operator'} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <Label>{isHe ? 'סוג הפעולה' : 'Action Type'}</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="input-noc">
                <SelectValue placeholder={isHe ? 'בחר סוג פעולה' : 'Select action type'} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50">
                {ACTION_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {isHe ? 'ביטול' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={!requestorId || !operatorId || !actionType}>
              {isHe ? 'הוסף' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
