import { cn } from '@undp/design-system-react/cn';
import React from 'react';

function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'bg-[var(--color-white-bg)] shadow-[0_5px_60px_0_rgba(0,0,0,0.20)] rounded-[8px] basis-full lg:basis-[calc(50%-0.75rem)] p-4 lg:p-6 pr-4 lg:pr-8 min-w-0 lg:min-w-[320px] flex flex-col gap-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Card };
