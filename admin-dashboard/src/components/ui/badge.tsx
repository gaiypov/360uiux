import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        {
          'bg-glass-medium text-foreground': variant === 'default',
          'bg-success/20 text-success': variant === 'success',
          'bg-warning/20 text-warning': variant === 'warning',
          'bg-error/20 text-error': variant === 'error',
          'bg-info/20 text-info': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
