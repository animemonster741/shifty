import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { TEAMS, SHIFT_PRESETS, COMMON_HOURS, Team, ShiftPreset } from '@/types';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Clock, Zap, CalendarIcon, Sun, Sunset, Moon } from 'lucide-react';
import { format, setHours, setMinutes, isBefore, addDays, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';
import { checkApprovalRequired, getApprovalReasonText } from '@/utils/approvalLogic';
import { cn } from '@/lib/utils';

interface AddAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

interface ParsedAlertData {
  createdTime?: Date;
  team?: Team | '';
  system?: string;
  deviceName?: string;
  summary?: string;
}

// Parser for structured alert content
function parseAlertContent(content: string): ParsedAlertData {
  const result: ParsedAlertData = {};
  
  // Parse CreatedTime: 2025\12\28 18:18:12 or 2025/12/28 18:18:12
  const createdTimeMatch = content.match(/CreatedTime:\s*(\d{4}[\\\/]\d{2}[\\\/]\d{2}\s+\d{2}:\d{2}:\d{2})/i);
  if (createdTimeMatch) {
    const dateStr = createdTimeMatch[1].replace(/\\/g, '/');
    result.createdTime = new Date(dateStr);
  }
  
  // Parse Team
  const teamMatch = content.match(/Team:\s*(.+?)(?:\n|$)/i);
  if (teamMatch) {
    const teamValue = teamMatch[1].trim();
    // Try to match with existing teams
    const matchedTeam = TEAMS.find(t => 
      t.toLowerCase().includes(teamValue.toLowerCase()) || 
      teamValue.toLowerCase().includes(t.toLowerCase().split(' ')[0])
    );
    result.team = matchedTeam || '';
  }
  
  // Parse System
  const systemMatch = content.match(/System:\s*(.+?)(?:\n|$)/i);
  if (systemMatch) {
    result.system = systemMatch[1].trim();
  }
  
  // Parse DeviceName
  const deviceMatch = content.match(/DeviceName:\s*(.+?)(?:\n|$)/i);
  if (deviceMatch) {
    result.deviceName = deviceMatch[1].trim();
  }
  
  // Parse Summary
  const summaryMatch = content.match(/Summary:\s*(.+?)(?:\n|$)/i);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }
  
  return result;
}

export function AddAlertModal({ open, onOpenChange, onSubmit }: AddAlertModalProps) {
  const { user } = useAuth();
  const { language, direction } = useLanguage();
  const isHebrew = language === 'he';
  
  const [mode, setMode] = useState<'full' | 'quick'>('quick');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [alertPasteContent, setAlertPasteContent] = useState('');
  const [parsedData, setParsedData] = useState<ParsedAlertData>({});
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);

  const [formData, setFormData] = useState({
    instructionGivenBy: '',
    fullAlertPaste: '',
    team: '' as Team | '',
    system: '',
    deviceName: '',
    summary: '',
    notes: '',
  });

  // Translations
  const t = {
    title: isHebrew ? 'הוספת התראה להתעלמות' : 'Add Ignored Alert',
    description: isHebrew ? 'תיעוד התראה להתעלמות במהלך המשמרת' : 'Document an alert to be ignored during this shift',
    quickIgnore: isHebrew ? 'הוספה מהירה' : 'Quick Ignore',
    fullStructure: isHebrew ? 'מבנה מלא' : 'Full Structure',
    instructionGivenBy: isHebrew ? 'נותן ההנחיה' : 'Instruction Given By',
    pasteAlertContent: isHebrew ? 'הדבקת תוכן התראה' : 'Paste Alert Content',
    pasteAlertPlaceholder: isHebrew 
      ? 'הדבק את תוכן ההתראה כאן...\n\nדוגמה:\nCreatedTime: 2025\\12\\28 18:18:12\nTeam: DBA\nSystem: MYSQL\nDeviceName: 192.192.192.192\nSummary: error in sql query'
      : 'Paste the alert content here...\n\nExample:\nCreatedTime: 2025\\12\\28 18:18:12\nTeam: DBA\nSystem: MYSQL\nDeviceName: 192.192.192.192\nSummary: error in sql query',
    team: isHebrew ? 'צוות' : 'Team',
    system: isHebrew ? 'מערכת' : 'System',
    deviceName: isHebrew ? 'שם התקן' : 'Device Name',
    summary: isHebrew ? 'סיכום / תיאור' : 'Summary',
    ignoreUntil: isHebrew ? 'התעלמות עד' : 'Ignore Until',
    notes: isHebrew ? 'הערות (אופציונלי)' : 'Notes (Optional)',
    cancel: isHebrew ? 'ביטול' : 'Cancel',
    addIgnore: isHebrew ? 'הוספת התראה' : 'Add Ignore',
    submitForApproval: isHebrew ? 'שליחה לאישור' : 'Submit for Approval',
    expires: isHebrew ? 'פג תוקף:' : 'Expires:',
    exceptionIgnore: isHebrew ? 'התעלמות חריגה' : 'Exception Ignore',
    exceptionMessage: isHebrew 
      ? 'התעלמות מעל 48 שעות דורשת אישור מנהל. הבקשה תישלח לאישור.'
      : 'Ignores exceeding 48 hours require manager approval. This will be submitted as a pending request.',
    weekendException: isHebrew 
      ? 'אישור אוטומטי (נוהל סופ"ש) - התראות שנוצרות בין רביעי 17:00 לראשון 08:00 ופוקעות עד ראשון 08:00 אינן דורשות אישור.'
      : 'Automatic approval (Weekend rule) - Alerts created Wed 17:00 - Sun 08:00 expiring by Sun 08:00 don\'t require approval.',
    selectTeam: isHebrew ? 'בחר צוות' : 'Select team',
    managerPlaceholder: isHebrew ? 'שם מנהל או הפניה' : 'Manager name or reference',
    systemPlaceholder: isHebrew ? 'לדוגמה: Core Router, Firewall' : 'e.g., Core Router, Firewall',
    devicePlaceholder: isHebrew ? 'לדוגמה: RTR-CORE-01' : 'e.g., RTR-CORE-01',
    summaryPlaceholder: isHebrew ? 'סכם את ההתראה והסיבה להתעלמות...' : 'Summarize the alert and reason for ignoring...',
    notesPlaceholder: isHebrew ? 'הקשר נוסף, מספרי כרטיסים וכו\'' : 'Additional context, ticket numbers, etc.',
    errorSelectDuration: isHebrew ? 'נא לבחור משך זמן להתעלמות' : 'Please select an ignore duration',
    errorRequiredFields: isHebrew ? 'נא למלא את כל השדות הנדרשים' : 'Please fill in all required fields',
    errorPasteContent: isHebrew ? 'נא להדביק תוכן התראה' : 'Please paste alert content',
    warningApproval: isHebrew ? 'ההתראה נשלחה לאישור מנהל (מעל 48 שעות)' : 'Alert sent for manager approval (over 48h)',
    successCreated: isHebrew ? 'התראה להתעלמות נוצרה בהצלחה' : 'Ignored alert created successfully',
    successWeekendRule: isHebrew ? 'התראה נוצרה - אישור אוטומטי (נוהל סופ"ש)' : 'Alert created - Automatic approval (Weekend rule)',
    optional: isHebrew ? '(אופציונלי)' : '(Optional)',
    selectDate: isHebrew ? 'בחירת תאריך' : 'Select Date',
    selectTime: isHebrew ? 'בחירת שעה' : 'Select Time',
    today: isHebrew ? 'היום' : 'Today',
    tomorrow: isHebrew ? 'מחר' : 'Tomorrow',
    morning: isHebrew ? 'בוקר' : 'Morning',
    evening: isHebrew ? 'ערב' : 'Evening',
    night: isHebrew ? 'לילה' : 'Night',
    autoTomorrow: isHebrew ? 'נקבע אוטומטית למחר' : 'Automatically set to tomorrow',
  };

  const getIgnoreUntil = useCallback((): Date | null => {
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      let result = setMinutes(setHours(selectedDate, hours), minutes);
      return result;
    }
    return null;
  }, [selectedDate, selectedTime]);

  const ignoreUntil = getIgnoreUntil();
  const now = new Date();
  
  // Use the new approval logic utility
  const approvalCheck = ignoreUntil ? checkApprovalRequired(now, ignoreUntil) : null;
  const requiresApproval = approvalCheck?.requiresApproval ?? false;
  const isWeekendException = approvalCheck?.reason === 'weekend_exception';
  const isAdmin = user?.role === 'admin';

  const handleAlertPaste = useCallback((content: string) => {
    setAlertPasteContent(content);
    const parsed = parseAlertContent(content);
    setParsedData(parsed);
    
    // Auto-fill form data from parsed content
    setFormData(prev => ({
      ...prev,
      team: parsed.team || prev.team,
      system: parsed.system || prev.system,
      deviceName: parsed.deviceName || prev.deviceName,
      summary: parsed.summary || prev.summary,
      fullAlertPaste: content,
    }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ignoreUntil) {
      toast.error(t.errorSelectDuration);
      return;
    }

    if (mode === 'quick') {
      // Quick mode: require instructionGivenBy and pasted content
      if (!formData.instructionGivenBy) {
        toast.error(t.errorRequiredFields);
        return;
      }
      if (!alertPasteContent.trim()) {
        toast.error(t.errorPasteContent);
        return;
      }
    } else {
      // Full mode: require instructionGivenBy and team only
      if (!formData.instructionGivenBy || !formData.team) {
        toast.error(t.errorRequiredFields);
        return;
      }
    }

    const alertData = {
      ...formData,
      ignoreUntil,
      status: requiresApproval && !isAdmin ? 'pending' : 'active',
      addedBy: user?.employeeId,
      addedByName: user?.fullName,
      createdTime: parsedData.createdTime || new Date(),
      approvalReason: requiresApproval ? 'duration' : (isWeekendException ? 'weekend_exception' : undefined),
    };

    onSubmit(alertData);
    onOpenChange(false);
    resetForm();

    if (requiresApproval && !isAdmin) {
      toast.warning(t.warningApproval);
    } else if (isWeekendException) {
      toast.success(t.successWeekendRule);
    } else {
      toast.success(t.successCreated);
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
    setSelectedDate(undefined);
    setSelectedTime('');
    setAlertPasteContent('');
    setParsedData({});
  };

  // Smart shift button handler with auto-tomorrow logic
  const handleShiftSelect = useCallback((shift: ShiftPreset) => {
    const now = new Date();
    const shiftTimeToday = setMinutes(setHours(startOfDay(now), shift.hour), shift.minute);
    
    // If current time is past the shift time, set to tomorrow
    let targetDate: Date;
    if (isBefore(now, shiftTimeToday)) {
      targetDate = startOfDay(now);
    } else {
      targetDate = startOfDay(addDays(now, 1));
      toast.info(t.autoTomorrow, { duration: 2000 });
    }
    
    setSelectedDate(targetDate);
    setSelectedTime(`${shift.hour.toString().padStart(2, '0')}:${shift.minute.toString().padStart(2, '0')}`);
  }, [t.autoTomorrow]);

  // Handle common hour selection
  const handleCommonHourSelect = useCallback((hour: number, minute: number) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    setSelectedTime(timeStr);
    setIsTimePopoverOpen(false);
    
    // If no date selected, set to today or tomorrow based on time
    if (!selectedDate) {
      const now = new Date();
      const targetTimeToday = setMinutes(setHours(startOfDay(now), hour), minute);
      
      if (isBefore(now, targetTimeToday)) {
        setSelectedDate(startOfDay(now));
      } else {
        setSelectedDate(startOfDay(addDays(now, 1)));
        toast.info(t.autoTomorrow, { duration: 2000 });
      }
    }
  }, [selectedDate, t.autoTomorrow]);

  // Get shift icon
  const getShiftIcon = (shiftId: string) => {
    switch (shiftId) {
      case 'morning': return <Sun className="h-4 w-4" />;
      case 'evening': return <Sunset className="h-4 w-4" />;
      case 'night': return <Moon className="h-4 w-4" />;
      default: return null;
    }
  };

  // Format date label for display
  const getDateLabel = useMemo(() => {
    if (!selectedDate) return '';
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);
    
    if (selectedDate.getTime() === today.getTime()) {
      return isHebrew ? 'היום' : 'Today';
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      return isHebrew ? 'מחר' : 'Tomorrow';
    }
    return format(selectedDate, 'dd/MM/yyyy');
  }, [selectedDate, isHebrew]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'full' | 'quick')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick" className="gap-2">
              <Zap className="h-4 w-4" />
              {t.quickIgnore}
            </TabsTrigger>
            <TabsTrigger value="full" className="gap-2">
              <Clock className="h-4 w-4" />
              {t.fullStructure}
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <TabsContent value="quick" className="space-y-4 mt-0">
              {/* Quick Ignore: Instruction Given By */}
              <div className="space-y-2">
                <Label htmlFor="instructionGivenByQuick">{t.instructionGivenBy} *</Label>
                <Input
                  id="instructionGivenByQuick"
                  value={formData.instructionGivenBy}
                  onChange={(e) => setFormData({ ...formData, instructionGivenBy: e.target.value })}
                  placeholder={t.managerPlaceholder}
                  className="input-noc"
                />
              </div>

              {/* Quick Ignore: Paste Alert Content */}
              <div className="space-y-2">
                <Label htmlFor="alertPaste">{t.pasteAlertContent} *</Label>
                <Textarea
                  id="alertPaste"
                  value={alertPasteContent}
                  onChange={(e) => handleAlertPaste(e.target.value)}
                  placeholder={t.pasteAlertPlaceholder}
                  rows={6}
                  className="input-noc resize-none font-mono text-xs"
                />
                {/* Show parsed data preview */}
                {(parsedData.team || parsedData.system || parsedData.deviceName || parsedData.summary) && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 space-y-1">
                    <p className="font-medium">{isHebrew ? 'נתונים שזוהו:' : 'Parsed data:'}</p>
                    {parsedData.team && <p>{t.team}: {parsedData.team}</p>}
                    {parsedData.system && <p>{t.system}: {parsedData.system}</p>}
                    {parsedData.deviceName && <p>{t.deviceName}: {parsedData.deviceName}</p>}
                    {parsedData.summary && <p>{t.summary}: {parsedData.summary}</p>}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="full" className="space-y-4 mt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instructionGivenByFull">{t.instructionGivenBy} *</Label>
                  <Input
                    id="instructionGivenByFull"
                    value={formData.instructionGivenBy}
                    onChange={(e) => setFormData({ ...formData, instructionGivenBy: e.target.value })}
                    placeholder={t.managerPlaceholder}
                    className="input-noc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">{t.team} *</Label>
                  <Select
                    value={formData.team}
                    onValueChange={(value: Team) => setFormData({ ...formData, team: value })}
                  >
                    <SelectTrigger className="input-noc">
                      <SelectValue placeholder={t.selectTeam} />
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
                  <Label htmlFor="system">{t.system} {t.optional}</Label>
                  <Input
                    id="system"
                    value={formData.system}
                    onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                    placeholder={t.systemPlaceholder}
                    className="input-noc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceName">{t.deviceName} {t.optional}</Label>
                  <Input
                    id="deviceName"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder={t.devicePlaceholder}
                    className="input-noc"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">{t.summary} {t.optional}</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder={t.summaryPlaceholder}
                  rows={2}
                  className="input-noc resize-none"
                />
              </div>
            </TabsContent>

            {/* Common fields for both modes */}
            <div className="space-y-3">
              <Label>{t.ignoreUntil} *</Label>
              
              {/* Shift preset buttons */}
              <div className="flex flex-wrap gap-2">
                {SHIFT_PRESETS.map((shift) => (
                  <Button
                    key={shift.id}
                    type="button"
                    variant={selectedTime === `${shift.hour.toString().padStart(2, '0')}:${shift.minute.toString().padStart(2, '0')}` ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleShiftSelect(shift)}
                    className="gap-2"
                  >
                    {getShiftIcon(shift.id)}
                    {isHebrew ? shift.labelHe : shift.labelEn}
                  </Button>
                ))}
              </div>

              {/* Date and Time pickers */}
              <div className="flex flex-wrap gap-3 items-center">
                {/* Date Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[180px] justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 me-2" />
                      {selectedDate ? (
                        <span>
                          {getDateLabel}
                          {getDateLabel !== format(selectedDate, 'dd/MM/yyyy') && (
                            <span className="text-muted-foreground ms-1">
                              ({format(selectedDate, 'dd/MM')})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span>{t.selectDate}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < startOfDay(new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker with common hours dropdown */}
                <Popover open={isTimePopoverOpen} onOpenChange={setIsTimePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !selectedTime && "text-muted-foreground"
                      )}
                    >
                      <Clock className="h-4 w-4 me-2" />
                      {selectedTime || t.selectTime}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[160px] p-2" align="start">
                    <div className="space-y-1">
                      {COMMON_HOURS.map((timeOption) => (
                        <Button
                          key={timeOption.label}
                          variant={selectedTime === timeOption.label ? 'default' : 'ghost'}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleCommonHourSelect(timeOption.hour, timeOption.minute)}
                        >
                          {timeOption.label}
                        </Button>
                      ))}
                    </div>
                    <div className="border-t mt-2 pt-2">
                      <Input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => {
                          setSelectedTime(e.target.value);
                          setIsTimePopoverOpen(false);
                        }}
                        className="input-noc"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Display selected ignore until time */}
              {ignoreUntil && (
                <p className="text-sm text-muted-foreground">
                  {t.expires} {format(ignoreUntil, 'PPpp', { locale: isHebrew ? he : undefined })}
                </p>
              )}
            </div>

            {requiresApproval && !isAdmin && (
              <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning">{t.exceptionIgnore}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.exceptionMessage}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t.notesPlaceholder}
                rows={2}
                className="input-noc resize-none"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t.cancel}
              </Button>
              <Button type="submit">
                {requiresApproval && !isAdmin ? t.submitForApproval : t.addIgnore}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
