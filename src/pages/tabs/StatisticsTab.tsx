import { StatCard } from '@/components/statistics/StatCard';
import {
  TeamBreakdownChart,
  TimeSeriesChart,
  StatusDistributionChart,
} from '@/components/statistics/StatisticsCharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, Clock, Archive, CheckCircle } from 'lucide-react';

export function StatisticsTab() {
  const { t, direction } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in" dir={direction}>
      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('stats.totalActiveIgnores')}
          value={45}
          subtitle={t('stats.currentCount')}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ value: 12, label: t('stats.vsLastWeek') }}
        />
        <StatCard
          title={t('stats.createdToday')}
          value={8}
          subtitle={t('stats.rolling24h')}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title={t('stats.expiringSoon')}
          value={3}
          subtitle={t('stats.within6Hours')}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title={t('stats.totalArchived')}
          value={128}
          subtitle={t('stats.allTime')}
          icon={<Archive className="h-5 w-5" />}
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart />
        <TeamBreakdownChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <StatusDistributionChart />
        </div>
        <div className="lg:col-span-2">
          <div className="card-elevated rounded-lg p-6">
            <h3 className="font-semibold mb-4">{t('stats.topRecurring')}</h3>
            <div className="space-y-3">
              {[
                { device: 'RTR-CORE-01', count: 12, summary: 'High CPU utilization' },
                { device: 'FW-SEC-PROD-02', count: 8, summary: 'Connection threshold warning' },
                { device: 'SAN-PROD-01', count: 6, summary: 'Disk latency warnings' },
                { device: 'db-primary-west', count: 5, summary: 'Replication lag detected' },
                { device: 'LB-APP-PROD-01', count: 4, summary: 'Backend health oscillating' },
              ].map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm">{alert.device}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {alert.summary}
                    </p>
                  </div>
                  <div className="ms-4 text-end">
                    <p className="text-lg font-bold">{alert.count}</p>
                    <p className="text-xs text-muted-foreground">{t('stats.ignores')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}