import { useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue
} from './Combobox';
import { Spinner } from './Spinner';
import { Typography } from './Typography';

export type MultiSelectComboboxItem = { value: string; label: string };

export type MultiSelectComboboxProps = {
  items: MultiSelectComboboxItem[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  query?: string;
  minQueryLength?: number;
  onQueryChange?: (query: string) => void;
  isLoading?: boolean;
  closeOnChange?: boolean;
  className?: string;
};

export const MultiSelectCombobox = ({
  items,
  selected,
  onChange,
  placeholder,
  searchable,
  closeOnChange,
  className,
  query,
  minQueryLength,
  onQueryChange,
  isLoading
}: MultiSelectComboboxProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const displayValue = useMemo(
    () => selected.map((val) => items.find((i) => i.value === val)?.label || val).join(', '),
    [items, selected]
  );

  const hasSelected = displayValue.length > 0;

  const onValueChange = (value: string[]) => {
    if (closeOnChange) {
      onChange(value);
      setOpen(false);
    } else {
      onChange(value);
    }
  };

  return (
    <Combobox
      items={items}
      multiple
      value={selected}
      onValueChange={onValueChange}
      open={closeOnChange ? open : undefined}
      onOpenChange={closeOnChange ? setOpen : undefined}
    >
      <div className={cn('flex items-center gap-1 relative', className)} ref={anchorRef}>
        <ComboboxTrigger
          className={`grow rounded-l-lg h-10.5 sm:h-13 flex items-center pl-3 pr-2.5 lg:min-w-40 ${hasSelected ? 'bg-secondary-5' : 'bg-white-3 rounded-r-lg'}`}
        >
          {hasSelected ? (
            <ComboboxValue>
              <span className="whitespace-nowrap pr-1">{displayValue}</span>
            </ComboboxValue>
          ) : (
            <span>{placeholder}</span>
          )}
        </ComboboxTrigger>
        {hasSelected ? (
          <div className="bg-secondary-5 text-primary-1-foreground rounded-r-lg  px-1.5 h-10.5 sm:h-13 flex items-center">
            <ComboboxClear />
          </div>
        ) : null}
      </div>
      <ComboboxContent anchor={anchorRef}>
        {searchable ? (
          <ComboboxInput value={query} onChange={(e) => onQueryChange?.(e.target.value)} />
        ) : null}
        {!isLoading && !(!onQueryChange || (!!onQueryChange && !query)) && (
          <ComboboxEmpty>
            {minQueryLength && query && query.length < minQueryLength
              ? `Enter ${minQueryLength} or more characters`
              : 'No items found.'}
          </ComboboxEmpty>
        )}
        <ComboboxList>
          {isLoading ? (
            <div className="p-4 flex space-x-2 items-center text-gray-1">
              <Spinner className="size-5" />
              <Typography variant="subtitle-sm">Loading...</Typography>
            </div>
          ) : (
            (item) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
