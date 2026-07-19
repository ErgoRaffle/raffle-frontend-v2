import { useMemo, useState } from 'react';

import { MultiSelectCombobox } from '@ergo-raffle/ui-kit';

import { useDebounceString, useFetchTags } from '@/hooks';

export type TokenFilterProps = {
  value: string[];
  onChange: (values: string[]) => void;
};

export const TagsFilter = ({ value, onChange }: TokenFilterProps) => {
  const [tagsQuery, setTagsQuery] = useState<string>('');
  const debouncedTagsQuery = useDebounceString(tagsQuery);
  const filters = useMemo(() => ({ query: debouncedTagsQuery }), [debouncedTagsQuery]);
  const { data: tagsFilterData, isLoading } = useFetchTags(filters);

  const tokenItems = useMemo(() => {
    if (tagsQuery.length < 3) return [];
    return (
      tagsFilterData?.map((item) => ({
        value: item,
        label: item
      })) ?? []
    );
  }, [tagsFilterData, tagsQuery]);

  return (
    <MultiSelectCombobox
      items={tokenItems}
      selected={value}
      onChange={onChange}
      placeholder="Category"
      closeOnChange
      searchable
      query={tagsQuery}
      onQueryChange={setTagsQuery}
      minQueryLength={3}
      isLoading={!!tagsQuery.length && isLoading}
      className="flex-1 lg:flex-auto lg:min-w-52"
    />
  );
};
