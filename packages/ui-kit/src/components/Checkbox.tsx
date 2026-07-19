import type { ComponentProps } from 'react';

import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { Check } from '@ergo-raffle/icons';

import { cn } from '@/lib/utils';

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root>;

export const Checkbox = ({ className, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(
      'peer border-gray-2 data-[state=checked]:bg-primary-1 data-[state=checked]:text-primary-1-foreground data-[state=checked]:border-primary-1 focus-visible:border-gray-1 aria-invalid:ring-destructive/20 aria-invalid:border-error size-4 shrink-0 rounded-xs border-2 transition-shadow outline-none disabled:cursor-not-allowed disabled:border-gray-3 disabled:data-[state=checked]:border-gray-3 disabled:data-[state=checked]:bg-gray-3 ',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="grid place-content-center text-current transition-none"
    >
      <Check className="size-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
