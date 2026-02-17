import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TokenPerson } from '@/pages/tabs/TokensTab';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: TokenPerson;
  onSubmit: (data: { full_name: string; id_number: string; company: string; phone_number: string; token_type: string }) => void;
}

export function EditTokenPersonModal({ open, onOpenChange, person, onSubmit }: Props) {
  const { direction } = useLanguage();
  const isHe = direction === 'rtl';
  const [form, setForm] = useState({
    full_name: person.full_name,
    id_number: person.id_number,
    company: person.company,
    phone_number: person.phone_number,
    token_type: person.token_type,
  });

  useEffect(() => {
    setForm({
      full_name: person.full_name,
      id_number: person.id_number,
      company: person.company,
      phone_number: person.phone_number,
      token_type: person.token_type,
    });
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.id_number.trim() || !form.company.trim() || !form.phone_number.trim() || !form.token_type.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={direction} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isHe ? 'עריכת רשומה' : 'Edit Record'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{isHe ? 'שם מלא' : 'Full Name'}</Label>
            <Input className="input-noc" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>{isHe ? 'ת.ז' : 'ID Number'}</Label>
            <Input className="input-noc" value={form.id_number} onChange={e => setForm(p => ({ ...p, id_number: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>{isHe ? 'חברה' : 'Company'}</Label>
            <Input className="input-noc" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>{isHe ? 'מספר טלפון' : 'Phone Number'}</Label>
            <Input className="input-noc" value={form.phone_number} onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>{isHe ? 'סוג טוקן' : 'Token Type'}</Label>
            <Input className="input-noc" value={form.token_type} onChange={e => setForm(p => ({ ...p, token_type: e.target.value }))} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isHe ? 'ביטול' : 'Cancel'}
            </Button>
            <Button type="submit">{isHe ? 'שמור' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
