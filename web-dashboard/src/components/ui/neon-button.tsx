import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const neonButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Neon gradient button with glow
        neon: 'bg-gradient-neon text-white shadow-neon hover:shadow-neon-sm hover:scale-[1.02] active:scale-[0.98]',

        // Glass button
        glass: 'bg-glass-bg backdrop-blur-glass border border-glass-border text-foreground hover:bg-glass-hover hover:border-primary/30',

        // Outline button
        outline: 'border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary',

        // Ghost button
        ghost: 'text-foreground-secondary hover:bg-glass-bg hover:text-foreground',

        // Destructive button
        destructive: 'bg-destructive text-white hover:bg-destructive/90',

        // Success button
        success: 'bg-success text-white hover:bg-success/90',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-12 px-8 py-3',
        xl: 'h-14 px-10 py-4 text-base',
        icon: 'h-10 w-10',
      },
      glow: {
        true: 'animate-glow',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neon',
      size: 'default',
      glow: false,
    },
  }
);

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean;
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(neonButtonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
NeonButton.displayName = 'NeonButton';

export { NeonButton, neonButtonVariants };
