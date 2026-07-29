import { type ComponentPropsWithRef, useRef } from 'react';

import { Combobox as ComboboxPrimitive } from '@base-ui/react';

import { Check, Close, Down, Search } from '@ergo-raffle/icons';

import { cn } from '@/lib/utils';

import { Badge } from './Badge';
import { Button } from './Button';
import { InputGroup, InputGroupAddon, InputGroupInput } from './InputGroup';

export const Combobox = ComboboxPrimitive.Root;

export type ComboboxValueProps = ComboboxPrimitive.Value.Props;

export const ComboboxValue = ({ ...props }: ComboboxValueProps) => (
  <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
);

export type ComboboxTriggerProps = ComboboxPrimitive.Trigger.Props;

export const ComboboxTrigger = ({ className, children, ...props }: ComboboxTriggerProps) => (
  <ComboboxPrimitive.Trigger
    data-slot="combobox-trigger"
    className={cn('flex items-center justify-between typo-body-md', className)}
    {...props}
  >
    {children}
    <Down className="size-6 pointer-events-none" />
  </ComboboxPrimitive.Trigger>
);

export type ComboboxClearProps = ComboboxPrimitive.Clear.Props;

export const ComboboxClear = ({ className, ...props }: ComboboxClearProps) => (
  <ComboboxPrimitive.Clear
    data-slot="combobox-clear"
    className={cn(className)}
    {...props}
    render={
      <Button variant="plain" size="icon-xs">
        <Close className="pointer-events-none" />
      </Button>
    }
  />
);

export type ComboboxInputProps = ComboboxPrimitive.Input.Props;

export const ComboboxInput = ({
  className,
  children,
  disabled = false,
  ...props
}: ComboboxInputProps) => (
  <InputGroup className={cn('w-auto mx-2', className)} size="sm">
    <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
    {children}
    <InputGroupAddon align="inline-end">
      <Search className="size-5" />
    </InputGroupAddon>
  </InputGroup>
);

export type ComboboxContentProps = ComboboxPrimitive.Popup.Props &
  Pick<ComboboxPrimitive.Positioner.Props, 'anchor'> & {
    portalContainerRef?: React.RefObject<HTMLDivElement | null>;
  };

export const ComboboxContent = ({
  className,
  anchor,
  portalContainerRef,
  ...props
}: ComboboxContentProps) => (
  <ComboboxPrimitive.Portal container={portalContainerRef?.current}>
    <ComboboxPrimitive.Positioner anchor={anchor} className="isolate z-100">
      <ComboboxPrimitive.Popup
        data-slot="combobox-content"
        data-chips={!!anchor}
        className={cn(
          'py-2.5 bg-gray-4 dark:bg-background dark:text-foreground dark:shadow-2 mt-2 text-gray-4-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 overflow-hidden rounded-lg shadow-md duration-100 *:data-[slot=input-group]:shadow-none data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) data-[chips=true]:min-w-(--anchor-width)',
          className
        )}
        {...props}
      />
    </ComboboxPrimitive.Positioner>
  </ComboboxPrimitive.Portal>
);

export type ComboboxListProps = ComboboxPrimitive.List.Props;

export const ComboboxList = ({ className, ...props }: ComboboxListProps) => (
  <ComboboxPrimitive.List
    data-slot="combobox-list"
    className={cn(
      'no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 py-1 px-2 data-empty:p-0 overflow-y-auto overscroll-contain',
      className
    )}
    {...props}
  />
);

export type ComboboxItemProps = ComboboxPrimitive.Item.Props;

export const ComboboxItem = ({ className, children, ...props }: ComboboxItemProps) => (
  <ComboboxPrimitive.Item
    data-slot="combobox-item"
    className={cn(
      "gap-2 py-2 px-2.5 typo-subtitle-lg [&_svg:not([class*='size-'])]:size-4 relative flex w-full rounded-md justify-between cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:bg-gray-5 hover:text-gray-5-foreground",
      className
    )}
    {...props}
  >
    {children}
    <span className="border-2 border-gray-2 rounded-xs flex items-center justify-center size-4">
      <ComboboxPrimitive.ItemIndicator render={<Check className="pointer-events-none" />} />
    </span>
  </ComboboxPrimitive.Item>
);

export type ComboboxEmptyProps = ComboboxPrimitive.Empty.Props;

export const ComboboxEmpty = ({ className, ...props }: ComboboxEmptyProps) => (
  <ComboboxPrimitive.Empty
    data-slot="combobox-empty"
    className={cn(
      'hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex',
      className
    )}
    {...props}
  />
);

export type ComboboxChipsProps = ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props;

export const ComboboxChips = ({ className, children, ...props }: ComboboxChipsProps) => (
  <ComboboxPrimitive.Chips
    data-slot="combobox-chips"
    {...props}
    render={
      <InputGroup
        className={cn(
          'w-full has-data-[slot=combobox-chip]:pl-1 **:data-[slot=combobox-chip-input]:pl-0 gap-2',
          className
        )}
        variant="bordered"
        size="sm"
      >
        {children}
      </InputGroup>
    }
  />
);

export type ComboboxChipProps = ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
};

export const ComboboxChip = ({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxChipProps) => (
  <ComboboxPrimitive.Chip
    data-slot="combobox-chip"
    {...props}
    render={
      <Badge
        variant="secondary"
        className={cn('has-data-[slot=combobox-chip-remove]:pr-0', className)}
      >
        {children}
        {showRemove ? (
          <ComboboxPrimitive.ChipRemove
            className="-ml-1 opacity-50 hover:opacity-100"
            data-slot="combobox-chip-remove"
            render={
              <Button variant="plain" size="icon-xs">
                <Close className="pointer-events-none size-5" />
              </Button>
            }
          />
        ) : null}
      </Badge>
    }
  />
);

export type ComboboxChipsInputProps = ComboboxPrimitive.Input.Props;

export const ComboboxChipsInput = ({
  className,
  disabled = false,
  ...props
}: ComboboxChipsInputProps) => (
  <ComboboxPrimitive.Input
    data-slot="combobox-chip-input"
    className={cn('min-w-16 flex-1 outline-none', className)}
    render={<InputGroupInput disabled={disabled} size="sm" />}
    {...props}
  />
);

export const useComboboxAnchor = () => useRef<HTMLDivElement | null>(null);
