import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300',
  {
    variants: {
      variant: {
        // Status variants with neon glow
        active: 'bg-success/10 text-success border border-success/30 shadow-[0_0_10px_rgba(48,209,88,0.2)]',
        pending: 'bg-warning/10 text-warning border border-warning/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
        rejected: 'bg-destructive/10 text-destructive border border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
        closed: 'bg-foreground-muted/10 text-foreground-muted border border-foreground-muted/30',

        // Moderation statuses
        approved: 'bg-success/10 text-success border border-success/30 shadow-[0_0_10px_rgba(48,209,88,0.2)]',
        moderating: 'bg-secondary/10 text-secondary border border-secondary/30 shadow-[0_0_10px_rgba(57,224,248,0.2)]',

        // Application statuses
        new: 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_10px_rgba(142,127,255,0.2)]',
        viewed: 'bg-secondary/10 text-secondary border border-secondary/30',
        interview: 'bg-warning/10 text-warning border border-warning/30',
        hired: 'bg-success/10 text-success border border-success/30 shadow-[0_0_10px_rgba(48,209,88,0.2)]',

        // Generic variants
        default: 'bg-glass-bg border border-glass-border text-foreground-secondary',
        glass: 'bg-glass-bg backdrop-blur-glass border border-glass-border text-foreground',
      },
      glow: {
        true: 'animate-glow',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      glow: false,
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, variant, glow, dot = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(statusBadgeVariants({ variant, glow, className }))}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              variant === 'active' && 'bg-success',
              variant === 'pending' && 'bg-warning',
              variant === 'rejected' && 'bg-destructive',
              variant === 'closed' && 'bg-foreground-muted',
              variant === 'approved' && 'bg-success',
              variant === 'moderating' && 'bg-secondary',
              variant === 'new' && 'bg-primary',
              variant === 'viewed' && 'bg-secondary',
              variant === 'interview' && 'bg-warning',
              variant === 'hired' && 'bg-success',
              variant === 'default' && 'bg-foreground-muted',
              variant === 'glass' && 'bg-foreground'
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
