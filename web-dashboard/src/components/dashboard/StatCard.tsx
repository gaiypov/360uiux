import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {/* Icon */}
      <div className="absolute right-4 top-4 opacity-20">
        <Icon className="h-12 w-12" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="mb-1 text-sm font-medium text-foreground-secondary">{label}</div>
        <div className="mb-2 text-number-lg font-bold text-foreground">{value}</div>

        {/* Trend */}
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {trend.value > 0 ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-foreground-muted">vs last month</span>
          </div>
        )}
      </div>

      {/* Gradient line */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-primary opacity-50"></div>
    </Card>
  );
}
