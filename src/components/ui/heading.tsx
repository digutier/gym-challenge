import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const headingVariants = cva('font-bold text-[#f1f5f9]', {
  variants: {
    size: {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

function Heading({
  className,
  size,
  as: Comp = 'p',
  asChild = false,
  ...props
}: React.ComponentProps<'p'> &
  VariantProps<typeof headingVariants> & {
    as?: React.ElementType;
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : Comp;

  return (
    <Component
      data-slot="heading"
      className={cn(headingVariants({ size, className }))}
      {...props}
    />
  );
}

export { Heading, headingVariants };
