import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IgnoredAlert, TEAMS, QUICK_DURATIONS, Team, AlertChangeLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertTriangle, Edit, History, Clock } from 'lucide-react';
import { addHours, format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface EditAlertModalProps {
  alert: IgnoredAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (alert: IgnoredAlert, changeLogs: AlertChangeLog[]) => void;
}

export function EditAlertModal({ alert, open, onOpenChange, onSubmit }: EditAlertModalProps) {
  const { user } = useAuth();
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

  // Reset form when alert changes
  useEffect(() => {
    if (alert) {
      setFormData({
        instructionGivenBy: alert.instructionGivenBy,
        fullAlertPaste: alert.fullAlertPaste || '',
        team: alert.team as Team,
        system: alert.system,
        deviceName: alert.deviceName,
        summary: alert.summary,
        notes: alert.notes || '',
      });
      setSelectedDuration(null);
      setCustomDate(format(alert.ignoreUntil, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [alert]);

  if (!alert) return null;

  const getIgnoreUntil = (): Date => {
    if (selectedDuration) {
      return addHours(new Date(), selectedDuration);
    }
    if (customDate) {
      return new Date(customDate);
    }
    return alert.ignoreUntil;
  };

  const ignoreUntil = getIgnoreUntil();
  const isExceptionIgnore = ignoreUntil && (ignoreUntil.getTime() - new Date().getTime()) > 72 * 60 * 60 * 1000;
  const isAdmin = user?.role === 'admin';
  const canEdit = alert.status === 'active' || alert.status === 'pending';

  const generateChangeLogs = (): AlertChangeLog[] => {
    const logs: AlertChangeLog[] = [];
    const now = new Date();

    const checkChange = (fieldName: string, oldValue: string, newValue: string) => {
      if (oldValue !== newValue) {
        logs.push({
          id: `log-${Date.now()}-${fieldName}`,
          alertId: alert.id,
          changedBy: user?.employeeId || '',
          changedByName: user?.fullName || '',
          changedAt: now,
          fieldName,
          oldValue,
          newValue,
        });
      }
    };

    checkChange('instructionGivenBy', alert.instructionGivenBy, formData.instructionGivenBy);
    checkChange('team', alert.team, formData.team);
    checkChange('system', alert.system, formData.system);
    checkChange('deviceName', alert.deviceName, formData.deviceName);
    checkChange('summary', alert.summary, formData.summary);
    checkChange('notes', alert.notes || '', formData.notes);
    checkChange('fullAlertPaste', alert.fullAlertPaste || '', formData.fullAlertPaste);
    checkChange('ignoreUntil', format(alert.ignoreUntil, 'PPpp'), format(ignoreUntil, 'PPpp'));

    return logs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error('Only active alerts can be edited');
      return;
    }

    if (!formData.instructionGivenBy || !formData.team || !formData.summary) {
      toast.error('Please fill in all required fields');
      return;
    }

    const changeLogs = generateChangeLogs();
    
    if (changeLogs.length === 0) {
      toast.info('No changes detected');
      onOpenChange(false);
      return;
    }

    const updatedAlert: IgnoredAlert = {
      ...alert,
      ...formData,
      ignoreUntil,
      modifiedBy: user?.employeeId,
      modifiedByName: user?.fullName,
      modifiedTime: new Date(),
      changeLogs: [...(alert.changeLogs || []), ...changeLogs],
    };

    onSubmit(updatedAlert, changeLogs);
    onOpenChange(false);
    toast.success(`Alert updated with ${changeLogs.length} change(s) logged`);
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
            <Edit className="h-5 w-5 text-primary" />
            Edit Alert
          </DialogTitle>
          <DialogDescription>
            {canEdit 
              ? 'Modify the alert details. All changes will be logged for auditing.'
              : 'This alert cannot be edited as it is no longer active.'
            }
          </DialogDescription>
        </DialogHeader>

        {!canEdit ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive">Cannot Edit</p>
              <p className="text-sm text-muted-foreground">
                Only active or pending alerts can be edited. This alert is currently {alert.status}.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="system">System</Label>
                <Input
                  id="system"
                  value={formData.system}
                  onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                  placeholder="e.g., Core Router, Firewall"
                  className="input-noc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name</Label>
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
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Summarize the alert and reason for ignoring..."
                rows={3}
                className="input-noc resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullAlertPaste">Full Alert Paste (Optional)</Label>
              <Textarea
                id="fullAlertPaste"
                value={formData.fullAlertPaste}
                onChange={(e) => setFormData({ ...formData, fullAlertPaste: e.target.value })}
                placeholder="Paste the complete alert text here..."
                rows={2}
                className="input-noc resize-none font-mono text-xs"
              />
            </div>

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
              </div>
              <Input
                type="datetime-local"
                value={customDate || format(ignoreUntil, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setSelectedDuration(null);
                }}
                className="input-noc w-full sm:w-auto"
              />
              <p className="text-sm text-muted-foreground">
                Current: {format(ignoreUntil, 'PPpp')}
              </p>
            </div>

            {isExceptionIgnore && !isAdmin && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">Exception Ignore</p>
                  <p className="text-sm text-muted-foreground">
                    Ignores exceeding 72 hours require manager approval.
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

            {/* Change History */}
            {alert.changeLogs && alert.changeLogs.length > 0 && (
              <>
                <Separator />
                <Accordion type="single" collapsible>
                  <AccordionItem value="history">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Change History ({alert.changeLogs.length} changes)
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {alert.changeLogs.map((log) => (
                          <div key={log.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{log.changedByName}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(log.changedAt, { addSuffix: true })}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">
                                {log.fieldName}
                              </Badge>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Before:</p>
                                  <p className="text-xs line-clamp-2">{log.oldValue || '(empty)'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">After:</p>
                                  <p className="text-xs line-clamp-2">{log.newValue || '(empty)'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
