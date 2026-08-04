import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textVariants = cva('', {
  variants: {
    size: {
      '9px': 'text-[9px]',
      '10px': 'text-[10px]',
      '11px': 'text-[11px]',
      '12px': 'text-[12px]',
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
    },
    color: {
      primary: 'text-[#f1f5f9]',
      secondary: 'text-[#94a3b8]',
      muted: 'text-[#64748b]',
      accent: 'text-[#7f0df2]',
      danger: 'text-red-400',
      success: 'text-emerald-400',
      gold: 'text-amber-400',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      black: 'font-black',
    },
  },
  defaultVariants: {
    size: 'sm',
    color: 'primary',
    weight: 'normal',
  },
});

function Text({
  className,
  size,
  color,
  weight,
  as: Comp = 'p',
  asChild = false,
  ...props
}: React.ComponentProps<'p'> &
  VariantProps<typeof textVariants> & {
    as?: React.ElementType;
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : Comp;

  return (
    <Component
      data-slot="text"
      className={cn(textVariants({ size, color, weight, className }))}
      {...props}
    />
  );
}

export { Text, textVariants };
