import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none',
        'placeholder:text-muted-foreground',
        'focus-visible:ring-[3px]',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
