import { AlertFilters, TEAMS, SYSTEMS, AlertStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface FilterPanelProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  showStatusFilter?: boolean;
}

const defaultFilters: AlertFilters = {
  searchQuery: '',
  team: 'all',
  system: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export function FilterPanel({ filters, onFiltersChange, showStatusFilter = false }: FilterPanelProps) {
  const { t, direction } = useLanguage();
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return false;
    return value && value !== 'all' && value !== '';
  }).length;

  const handleReset = () => {
    onFiltersChange({ ...defaultFilters, searchQuery: filters.searchQuery });
  };

  const removeFilter = (key: keyof AlertFilters) => {
    const newFilters = { ...filters };
    if (key === 'team' || key === 'system' || key === 'status') {
      newFilters[key] = 'all' as any;
    } else {
      newFilters[key] = '';
    }
    onFiltersChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {t('common.filter')}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ms-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side={direction === 'rtl' ? 'left' : 'right'}>
            <SheetHeader>
              <SheetTitle>{t('common.filter')}</SheetTitle>
              <SheetDescription>
                {t('common.filter')}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="team-filter">{t('alerts.team')}</Label>
                <Select
                  value={filters.team}
                  onValueChange={(value) => onFiltersChange({ ...filters, team: value })}
                >
                  <SelectTrigger id="team-filter" className="input-noc">
                    <SelectValue placeholder={t('filter.allTeams')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filter.allTeams')}</SelectItem>
                    {TEAMS.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-filter">{t('alerts.system')}</Label>
                <Select
                  value={filters.system}
                  onValueChange={(value) => onFiltersChange({ ...filters, system: value })}
                >
                  <SelectTrigger id="system-filter" className="input-noc">
                    <SelectValue placeholder={t('filter.allSystems')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filter.allSystems')}</SelectItem>
                    {SYSTEMS.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showStatusFilter && (
                <div className="space-y-2">
                  <Label htmlFor="status-filter">{t('common.status')}</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => onFiltersChange({ ...filters, status: value as AlertStatus | 'all' })}
                  >
                    <SelectTrigger id="status-filter" className="input-noc">
                      <SelectValue placeholder={t('filter.allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('filter.allStatuses')}</SelectItem>
                      <SelectItem value="active">{t('status.active')}</SelectItem>
                      <SelectItem value="pending">{t('status.pending')}</SelectItem>
                      <SelectItem value="expired">{t('status.expired')}</SelectItem>
                      <SelectItem value="deleted">{t('status.deleted')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date-from">{t('common.from')}</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="input-noc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">{t('common.to')}</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="input-noc"
                />
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button variant="outline" onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.team && filters.team !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t('alerts.team')}: {filters.team}
              <button onClick={() => removeFilter('team')} className="ms-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.system && filters.system !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t('alerts.system')}: {filters.system}
              <button onClick={() => removeFilter('system')} className="ms-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {showStatusFilter && filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {t('common.status')}: {filters.status}
              <button onClick={() => removeFilter('status')} className="ms-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              {t('common.from')}: {filters.dateFrom}
              <button onClick={() => removeFilter('dateFrom')} className="ms-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              {t('common.to')}: {filters.dateTo}
              <button onClick={() => removeFilter('dateTo')} className="ms-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-6 text-xs">
            {t('filter.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
