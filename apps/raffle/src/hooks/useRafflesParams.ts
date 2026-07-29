'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type {
  GetRaffleDirection,
  GetRaffleOrder,
  GetRaffleParams,
  GetRaffleStatusAnyOfItem
} from '@ergo-raffle/client';

import { PINED_RAFFLES_STORAGE_KEY } from '@/constants';

const doNotNeedResetPage = ['sort', 'sortBy', 'page'];

export const useRafflesQuery = (defaults?: { page?: number; perPage?: number }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const text = searchParams.get('text') ?? '';
  const [search, setSearch] = useState<string | undefined>(text);

  const page = Number(searchParams.get('page') ?? defaults?.page ?? 1);
  const perPage = Number(searchParams.get('perPage') ?? defaults?.perPage ?? 12);

  const order = (searchParams.get('order') ?? undefined) as GetRaffleOrder | undefined;
  const direction = (searchParams.get('direction') ?? undefined) as GetRaffleDirection | undefined;

  const status = searchParams.getAll('status') as GetRaffleStatusAnyOfItem[];
  const tokenIds = searchParams.getAll('tokenIds');
  const ids = searchParams.getAll('ids');
  const pined = searchParams.get('pined') === 'true';
  const tags = searchParams.getAll('tags');

  const offset = (page - 1) * perPage;

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

    if (!doNotNeedResetPage.includes(key)) {
      params.set('page', '1');
    }
    router.push(`?${params.toString()}`);
  };

  const togglePinedParam = () => {
    const params = new URLSearchParams({});
    setSearch('');
    params.delete('status');
    if (ids.length > 0) {
      params.delete('ids');
      params.delete('pined');
    } else {
      params.append('pined', 'true');
      const stored = localStorage.getItem(PINED_RAFFLES_STORAGE_KEY);
      const items: string[] = stored ? JSON.parse(stored) : [];
      items.forEach((v) => {
        params.append('ids', v);
      });
    }
    router.push(`?${params.toString()}`);
  };

  const setStatusParamWithSwitchTabs = (tab?: string) => {
    const params = new URLSearchParams({});
    setSearch('');
    if (tab) {
      switch (tab) {
        case 'all':
          params.set('status', 'active');

          break;
        case 'history':
          params.append('status', 'failed');
          params.append('status', 'successful');
          break;

        default:
          break;
      }
    }
    router.push(`?${params.toString()}`);
  };

  const getPageLink = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    return `?${params.toString()}`;
  };

  const params: GetRaffleParams = {
    offset,
    limit: perPage,
    order,
    direction,
    status: status.length ? status : undefined,
    tokenIds: tokenIds.length ? tokenIds : undefined,
    ids: ids.length ? ids : undefined,
    text: text || undefined,
    tags: tags.length ? tags : undefined
  };

  return {
    page,
    perPage,
    pined,
    params,
    search,
    setSearch,
    setParam,
    getPageLink,
    togglePinedParam,
    setStatusParamWithSwitchTabs
  };
};
