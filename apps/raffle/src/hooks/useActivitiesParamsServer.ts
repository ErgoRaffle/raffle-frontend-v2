'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { GetActivityParams, GetActivityTypesAnyOfItem } from '@ergo-raffle/client';

export const useActivitiesQuery = (defaults?: { page?: number; perPage?: number }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page') ?? defaults?.page ?? 1);
  const perPage = Number(searchParams.get('perPage') ?? defaults?.perPage ?? 6);

  const types = searchParams.getAll('types') as GetActivityTypesAnyOfItem[];
  const address = searchParams.get('address') as string;

  const offset = useMemo(() => (page - 1) * perPage, [page, perPage]);

  const setParam = (key: string, value?: string | string[]) => {
    const params = new URLSearchParams(searchParams);

    if (Array.isArray(value)) {
      params.delete(key);
      value.forEach((v) => {
        params.append(key, v);
      });
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== 'page' && key !== 'address') {
      params.set('page', '1');
    }
    router.push(`?${params.toString()}`);
  };

  const onTypeFilterChange = (value: GetActivityTypesAnyOfItem) => {
    if (types.includes(value)) {
      const newTypes = types.filter((t) => t !== value);
      setParam('types', newTypes.length ? newTypes : undefined);
    } else {
      setParam('types', [value, ...types]);
    }
  };

  const getPageLink = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    return `?${params.toString()}`;
  };

  const params: GetActivityParams = {
    offset,
    limit: perPage,
    types,
    address
  };

  return { page, perPage, params, setParam, getPageLink, onTypeFilterChange };
};
