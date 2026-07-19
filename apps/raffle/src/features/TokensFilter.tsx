import { useMemo, useState } from 'react';

import { MultiSelectCombobox } from '@ergo-raffle/ui-kit';

import { useDebounceString, useFetchTokensSearch } from '@/hooks';

export type TokenFilterProps = {
  value: string[];
  onChange: (values: string[]) => void;
};

export const TokensFilter = ({ value, onChange }: TokenFilterProps) => {
  const [tokensQuery, setTokensQuery] = useState<string>('');
  const debouncedTokensQuery = useDebounceString(tokensQuery);
  const filters = useMemo(
    () => ({ query: debouncedTokensQuery, limit: 100, offset: 0 }),
    [debouncedTokensQuery]
  );
  const { data: tokensFilterData, isLoading } = useFetchTokensSearch(filters);

  const tokenItems = useMemo(() => {
    if (tokensQuery.length < 3) return [];
    const result =
      tokensFilterData?.items.map((item) => ({
        value: item.id,
        label: item.name ?? item.id
      })) ?? [];
    if (tokensQuery.includes('erg')) {
      result.push({
        value: 'erg',
        label: 'ERG'
      });
    }
    return result;
  }, [tokensFilterData, tokensQuery]);

  return (
    <MultiSelectCombobox
      items={tokenItems}
      selected={value}
      onChange={onChange}
      placeholder="Token"
      closeOnChange
      searchable
      query={tokensQuery}
      onQueryChange={setTokensQuery}
      minQueryLength={3}
      isLoading={!!tokensQuery.length && isLoading}
      className="flex-1 lg:flex-auto min-w-52"
    />
  );
};
