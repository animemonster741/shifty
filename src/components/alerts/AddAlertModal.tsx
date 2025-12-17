import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TEAMS, QUICK_DURATIONS, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import { addHours, format } from 'date-fns';
import { toast } from 'sonner';

interface AddAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddAlertModal({ open, onOpenChange, onSubmit }: AddAlertModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<'full' | 'quick'>('quick');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [customDate, setCustomDate] = useState('');

  const [formData, setFormData] = useState({
    instructionGivenBy: '',
    fullAlertPaste: '',
    team: '' as Team | '',
    system: '',
    deviceName: '',
    summary: '',
    notes: '',
  });

  const getIgnoreUntil = (): Date | null => {
    if (selectedDuration) {
      return addHours(new Date(), selectedDuration);
    }
    if (customDate) {
      return new Date(customDate);
    }
    return null;
  };

  const ignoreUntil = getIgnoreUntil();
  const isExceptionIgnore = ignoreUntil && (ignoreUntil.getTime() - new Date().getTime()) > 72 * 60 * 60 * 1000;
  const isAdmin = user?.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ignoreUntil) {
      toast.error('Please select an ignore duration');
      return;
    }

    if (!formData.instructionGivenBy || !formData.team || !formData.summary) {
      toast.error('Please fill in all required fields');
      return;
    }

    const alertData = {
      ...formData,
      ignoreUntil,
      status: isExceptionIgnore && !isAdmin ? 'pending' : 'active',
      addedBy: user?.employeeId,
      addedByName: user?.fullName,
      createdTime: new Date(),
    };

    onSubmit(alertData);
    onOpenChange(false);
    resetForm();

    if (isExceptionIgnore && !isAdmin) {
      toast.warning('Alert submitted for manager approval (>72h duration)');
    } else {
      toast.success('Ignored alert created successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      instructionGivenBy: '',
      fullAlertPaste: '',
      team: '',
      system: '',
      deviceName: '',
      summary: '',
      notes: '',
    });
    setSelectedDuration(null);
    setCustomDate('');
  };

  const handleDurationSelect = (hours: number) => {
    setSelectedDuration(hours);
    setCustomDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Add Ignored Alert
          </DialogTitle>
          <DialogDescription>
            Document an alert to be ignored during this shift
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'full' | 'quick')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Ignore
            </TabsTrigger>
            <TabsTrigger value="full" className="gap-2">
              <Clock className="h-4 w-4" />
              Full Structure
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <TabsContent value="quick" className="space-y-4 mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instructionGivenBy">Instruction Given By *</Label>
                  <Input
                    id="instructionGivenBy"
                    value={formData.instructionGivenBy}
                    onChange={(e) => setFormData({ ...formData, instructionGivenBy: e.target.value })}
                    placeholder="Manager name or reference"
                    className="input-noc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team *</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value: Team) => setFormData({ ...formData, team: value })}
                  >
                    <SelectTrigger className="input-noc">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAMS.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Description / Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Describe the alert and reason for ignoring..."
                  rows={3}
                  className="input-noc resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="full" className="space-y-4 mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instructionGivenBy">Instruction Given By *</Label>
                  <Input
                    id="instructionGivenBy"
                    value={formData.instructionGivenBy}
                    onChange={(e) => setFormData({ ...formData, instructionGivenBy: e.target.value })}
                    placeholder="Manager name or reference"
                    className="input-noc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team *</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value: Team) => setFormData({ ...formData, team: value })}
                  >
                    <SelectTrigger className="input-noc">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAMS.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="system">System *</Label>
                  <Input
                    id="system"
                    value={formData.system}
                    onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                    placeholder="e.g., Core Router, Firewall"
                    className="input-noc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name *</Label>
                  <Input
                    id="deviceName"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="e.g., RTR-CORE-01"
                    className="input-noc"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAlertPaste">Full Alert Paste (Optional)</Label>
                <Textarea
                  id="fullAlertPaste"
                  value={formData.fullAlertPaste}
                  onChange={(e) => setFormData({ ...formData, fullAlertPaste: e.target.value })}
                  placeholder="Paste the complete alert text here..."
                  rows={3}
                  className="input-noc resize-none font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Summarize the alert and reason for ignoring..."
                  rows={2}
                  className="input-noc resize-none"
                />
              </div>
            </TabsContent>

            {/* Common fields for both modes */}
            <div className="space-y-3">
              <Label>Ignore Until *</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK_DURATIONS.map((duration) => (
                  <Button
                    key={duration.hours}
                    type="button"
                    variant={selectedDuration === duration.hours ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDurationSelect(duration.hours)}
                  >
                    {duration.label}
                  </Button>
                ))}
                <Input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setSelectedDuration(null);
                  }}
                  className="input-noc w-auto"
                />
              </div>
              {ignoreUntil && (
                <p className="text-sm text-muted-foreground">
                  Expires: {format(ignoreUntil, 'PPpp')}
                </p>
              )}
            </div>

            {isExceptionIgnore && !isAdmin && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Exception Ignore</p>
                  <p className="text-sm text-muted-foreground">
                    Ignores exceeding 72 hours require manager approval. This will be submitted as a pending request.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional context, ticket numbers, etc."
                rows={2}
                className="input-noc resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isExceptionIgnore && !isAdmin ? 'Submit for Approval' : 'Add Ignore'}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
