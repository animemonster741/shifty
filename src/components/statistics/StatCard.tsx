import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'warning' | 'critical' | 'success';
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      'stat-card',
      variant === 'warning' && '[&::before]:bg-gradient-to-r [&::before]:from-warning [&::before]:to-warning/30',
      variant === 'critical' && '[&::before]:bg-gradient-to-r [&::before]:from-destructive [&::before]:to-destructive/30',
      variant === 'success' && '[&::before]:bg-gradient-to-r [&::before]:from-success [&::before]:to-success/30'
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn(
            'text-3xl font-bold',
            variant === 'warning' && 'text-warning',
            variant === 'critical' && 'text-destructive',
            variant === 'success' && 'text-success'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              'text-xs',
              trend.value >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn(
          'p-2 rounded-lg',
          variant === 'default' && 'bg-primary/10 text-primary',
          variant === 'warning' && 'bg-warning/10 text-warning',
          variant === 'critical' && 'bg-destructive/10 text-destructive',
          variant === 'success' && 'bg-success/10 text-success'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
