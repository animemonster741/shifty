import { TokenPerson } from '@/pages/tabs/TokensTab';
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
import { Pencil, Trash2, Loader2 } from 'lucide-react';

interface Props {
  people: TokenPerson[];
  isAdmin: boolean;
  onEdit: (person: TokenPerson) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function TokenRegistryTable({ people, isAdmin, onEdit, onDelete, isLoading }: Props) {
  const { direction } = useLanguage();
  const isHe = direction === 'rtl';

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
              <TableHead>{isHe ? 'שם מלא' : 'Full Name'}</TableHead>
              <TableHead>{isHe ? 'ת.ז' : 'ID Number'}</TableHead>
              <TableHead>{isHe ? 'חברה' : 'Company'}</TableHead>
              <TableHead>{isHe ? 'מספר טלפון' : 'Phone Number'}</TableHead>
              <TableHead>{isHe ? 'סוג טוקן' : 'Token Type'}</TableHead>
              {isAdmin && (
                <TableHead className="text-end">{isHe ? 'פעולות' : 'Actions'}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {people.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">
                  {isHe ? 'אין רשומות' : 'No records'}
                </TableCell>
              </TableRow>
            ) : (
              people.map((person) => (
                <TableRow key={person.id} className="transition-colors">
                  <TableCell className="font-medium">{person.full_name}</TableCell>
                  <TableCell className="font-mono text-sm">{person.id_number}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{person.company}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{person.phone_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{person.token_type}</Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(person)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent dir={direction}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{isHe ? 'מחיקת רשומה' : 'Delete Record'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {isHe ? 'האם אתה בטוח שברצונך למחוק רשומה זו? פעולה זו אינה ניתנת לביטול.' : 'Are you sure you want to delete this record? This action cannot be undone.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isHe ? 'ביטול' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(person.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
