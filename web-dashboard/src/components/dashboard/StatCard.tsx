import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <GlassCard className="relative overflow-hidden" glow>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-neon opacity-0 transition-opacity duration-300 group-hover:opacity-5" />

      {/* Icon with metal gradient */}
      <div className="absolute right-4 top-4 opacity-20">
        <div className="rounded-lg bg-gradient-metal p-2">
          <Icon className="h-8 w-8 text-ultra-black" />
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="mb-1 text-sm font-medium text-foreground-secondary uppercase tracking-wide">
          {label}
        </div>

        {loading ? (
          <div className="mb-2 h-10 w-32 animate-pulse rounded bg-glass-bg" />
        ) : (
          <div className="mb-2 text-number-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
            {value}
          </div>
        )}

        {/* Trend */}
        {trend && !loading && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend.isPositive ? 'text-success-green' : 'text-error-red'
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
            <span className="text-foreground-muted">vs прошлый месяц</span>
          </div>
        )}
      </div>

      {/* Neon line at bottom */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-neon opacity-50" />
    </GlassCard>
  );
}
