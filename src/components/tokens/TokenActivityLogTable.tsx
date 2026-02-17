import { TokenActivity } from '@/pages/tabs/TokensTab';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

const ACTION_TYPE_LABELS: Record<string, string> = {
  'מסירה': 'מסירה',
  'החזרה': 'החזרה',
  'איפוס סיסמה': 'איפוס סיסמה',
  'אובדן': 'אובדן',
  'תקלה': 'תקלה',
  'אחר': 'אחר',
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  'מסירה': 'bg-primary/10 text-primary border-primary/30',
  'החזרה': 'bg-success/10 text-success border-success/30',
  'איפוס סיסמה': 'bg-warning/10 text-warning border-warning/30',
  'אובדן': 'bg-destructive/10 text-destructive border-destructive/30',
  'תקלה': 'bg-destructive/10 text-destructive border-destructive/30',
  'אחר': 'bg-muted text-muted-foreground border-border',
};

interface Props {
  activities: TokenActivity[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function TokenActivityLogTable({ activities, isAdmin, onDelete, isLoading }: Props) {
  const { direction, language } = useLanguage();
  const isHe = direction === 'rtl';
  const dateLocale = language === 'he' ? he : enUS;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{isHe ? 'שם מבקש הטוקן' : 'Requestor Name'}</TableHead>
              <TableHead>{isHe ? 'חברה / סוג טוקן' : 'Company / Token Type'}</TableHead>
              <TableHead>{isHe ? 'שם המפעיל' : 'Operator Name'}</TableHead>
              <TableHead>{isHe ? 'סוג הפעולה' : 'Action Type'}</TableHead>
              <TableHead>{isHe ? 'זמן הפעולה' : 'Timestamp'}</TableHead>
              {isAdmin && (
                <TableHead className="text-end">{isHe ? 'פעולות' : 'Actions'}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">
                  {isHe ? 'אין פעולות' : 'No activities'}
                </TableCell>
              </TableRow>
            ) : (
              activities.map((activity) => (
                <TableRow key={activity.id} className="transition-colors">
                  <TableCell className="font-medium">
                    {activity.requestor?.full_name || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="font-normal w-fit">
                        {activity.requestor?.company || '-'}
                      </Badge>
                      <Badge variant="outline" className="w-fit">
                        {activity.requestor?.token_type || '-'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{activity.operator_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ACTION_TYPE_COLORS[activity.action_type] || ''}>
                      {activity.action_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir={direction}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{isHe ? 'מחיקת פעולה' : 'Delete Activity'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {isHe ? 'האם אתה בטוח שברצונך למחוק פעולה זו?' : 'Are you sure you want to delete this activity?'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isHe ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(activity.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {isHe ? 'מחק' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
