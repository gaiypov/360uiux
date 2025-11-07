import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlassInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              'flex h-11 w-full rounded-lg px-4 py-2.5 text-sm',
              'bg-glass-bg backdrop-blur-glass border border-glass-border',
              'text-foreground placeholder:text-foreground-muted',
              'transition-all duration-300',

              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',

              // Hover styles
              'hover:border-primary/30',

              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50',

              // Error styles
              error && 'border-destructive focus:ring-destructive/50',

              // Icon padding
              icon && 'pl-12',

              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
GlassInput.displayName = 'GlassInput';

export { GlassInput };
