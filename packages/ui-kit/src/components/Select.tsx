import type { ComponentProps } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { Select as SelectPrimitive } from 'radix-ui';

import { Check, Down, Up } from '@ergo-raffle/icons';

import { cn } from '@/lib/utils';

export type SelectProps = ComponentProps<typeof SelectPrimitive.Root>;

export const Select = ({ ...props }: SelectProps) => (
  <SelectPrimitive.Root data-slot="select" {...props} />
);

export type SelectGroupProps = ComponentProps<typeof SelectPrimitive.Group>;

export const SelectGroup = ({ className, ...props }: SelectGroupProps) => (
  <SelectPrimitive.Group
    data-slot="select-group"
    className={cn('scroll-my-1 p-1', className)}
    {...props}
  />
);

export type SelectValueProps = ComponentProps<typeof SelectPrimitive.Value>;

export const SelectValue = ({ ...props }: SelectValueProps) => (
  <SelectPrimitive.Value data-slot="select-value" {...props} />
);

export const selectTriggerVariants = cva(
  "text-black-1 data-placeholder:text-gray-2 focus-visible:border focus-visible:border-gray-2 aria-invalid:border-error gap-1.5 rounded-lg border border-transparent bg-transparent typo-body-md transition-colors select-none *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-6 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-black-4 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 'bg-white-3 text-white-3-foreground',
        plain: '',
        bordered: 'border-gray-4'
      },
      size: {
        default: 'h-10.5 sm:h-13 rounded-2xlg sm:rounded-lg px-3 sm:pl-4 sm:pr-3',
        sm: 'h-9.5 sm:h-10 rounded-md px-2 sm:pl-4 sm:pr-3'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants> & { showIcon?: boolean };

export const SelectTrigger = ({
  className,
  size = 'default',
  variant = 'default',
  children,
  showIcon = true,
  ...props
}: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    data-size={size}
    className={cn(selectTriggerVariants({ variant, size, className }))}
    {...props}
  >
    {children}
    {showIcon ? (
      <SelectPrimitive.Icon asChild>
        <Down className="size-6 pointer-events-none" />
      </SelectPrimitive.Icon>
    ) : null}
  </SelectPrimitive.Trigger>
);

export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content>;

export const SelectContent = ({
  className,
  children,
  position = 'item-aligned',
  align = 'center',
  ...props
}: SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      data-align-trigger={position === 'item-aligned'}
      className={cn(
        'bg-background p-2 text-foreground border border-gray-4 data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-gray-4  min-w-36 rounded-lg shadow-md ring-1 duration-100 relative z-50 max-h-(--radix-select-content-available-height) origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      align={align}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        data-position={position}
        className={cn(
          'data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)',
          position === 'popper' && ''
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

export type SelectLabelProps = ComponentProps<typeof SelectPrimitive.Label>;

export const SelectLabel = ({ className, ...props }: SelectLabelProps) => (
  <SelectPrimitive.Label
    data-slot="select-label"
    className={cn('px-1.5 py-1', className)}
    {...props}
  />
);

export type SelectItemProps = ComponentProps<typeof SelectPrimitive.Item>;

export const SelectItem = ({ className, children, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md py-2 pr-8 pl-1.5 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-gray-5 hover:text-gray-5-foreground",
      className
    )}
    {...props}
  >
    <span className="pointer-events-none absolute right-2 flex size-6 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

export type SelectSeparatorProps = ComponentProps<typeof SelectPrimitive.Separator>;

export const SelectSeparator = ({ className, ...props }: SelectSeparatorProps) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn('bg-border -mx-1 my-1 h-px pointer-events-none', className)}
    {...props}
  />
);

export type SelectScrollUpButtonProps = ComponentProps<typeof SelectPrimitive.ScrollUpButton>;

export const SelectScrollUpButton = ({ className, ...props }: SelectScrollUpButtonProps) => (
  <SelectPrimitive.ScrollUpButton
    data-slot="select-scroll-up-button"
    className={cn(
      "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-6",
      className
    )}
    {...props}
  >
    <Up />
  </SelectPrimitive.ScrollUpButton>
);

export type SelectScrollDownButtonProps = ComponentProps<typeof SelectPrimitive.ScrollDownButton>;

export const SelectScrollDownButton = ({ className, ...props }: SelectScrollDownButtonProps) => (
  <SelectPrimitive.ScrollDownButton
    data-slot="select-scroll-down-button"
    className={cn(
      "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-6",
      className
    )}
    {...props}
  >
    <Down />
  </SelectPrimitive.ScrollDownButton>
);
