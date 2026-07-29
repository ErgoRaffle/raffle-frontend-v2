'use client';

import type { KeyboardEvent } from 'react';

import type { GetRaffle200ItemsItemStatus } from '@ergo-raffle/client';
import { Search } from '@ergo-raffle/icons';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  MultiSelectCombobox,
  Tabs,
  TabsList,
  TabsTrigger
} from '@ergo-raffle/ui-kit';

import { useRafflesQuery } from '@/hooks';

import { TagsFilter } from './TagsFilter';
import { TokensFilter } from './TokensFilter';

const statusFilterItems: { value: GetRaffle200ItemsItemStatus; label: string }[] = [
  {
    value: 'active',
    label: 'Active'
  },
  {
    value: 'failed',
    label: 'Failed'
  },
  {
    value: 'successful',
    label: 'Successful'
  }
];

export const RafflesFilters = () => {
  const {
    search,
    params,
    setSearch,
    setParam,
    togglePinedParam,
    setStatusParamWithSwitchTabs,
    pined
  } = useRafflesQuery();

  const onSearch = () => {
    setParam('text', search);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };
  enum RAFFLE_LIST_TABS {
    ALL = 'All',
    ACTIVE = 'Active',
    HISTORY = 'History',
    PINED = 'Pinned'
  }

  const getTabValue = () => {
    if (pined) {
      return RAFFLE_LIST_TABS.PINED;
    }
    if (params.status?.length === 1) {
      if (params.status[0] === 'active') {
        return RAFFLE_LIST_TABS.ACTIVE;
      }
      if (params.status[0] === 'failed' || params.status[0] === 'successful') {
        return RAFFLE_LIST_TABS.HISTORY;
      }
    }
    return RAFFLE_LIST_TABS.ALL;
  };
  const onTabChange = (value: string) => {
    switch (value) {
      case RAFFLE_LIST_TABS.ACTIVE:
        setStatusParamWithSwitchTabs('all');
        break;
      case RAFFLE_LIST_TABS.HISTORY:
        setStatusParamWithSwitchTabs('history');
        break;
      case RAFFLE_LIST_TABS.PINED:
        togglePinedParam();
        break;
      default:
        setStatusParamWithSwitchTabs();
    }
  };

  return (
    <>
      <Tabs
        defaultValue={RAFFLE_LIST_TABS.ALL}
        value={getTabValue()}
        className="w-full"
        onValueChange={(value) => onTabChange(value)}
      >
        <TabsList>
          <TabsTrigger value={RAFFLE_LIST_TABS.ALL}>{RAFFLE_LIST_TABS.ALL}</TabsTrigger>
          <TabsTrigger value={RAFFLE_LIST_TABS.ACTIVE}>{RAFFLE_LIST_TABS.ACTIVE}</TabsTrigger>
          <TabsTrigger value={RAFFLE_LIST_TABS.HISTORY}>{RAFFLE_LIST_TABS.HISTORY}</TabsTrigger>
          <TabsTrigger value={RAFFLE_LIST_TABS.PINED}>{RAFFLE_LIST_TABS.PINED}</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col lg:flex-row items-center mb-8 lg:mb-16 gap-2 w-full lg:w-fit mx-auto">
        <div className="flex items-center gap-2 w-full lg:w-fit flex-wrap">
          <MultiSelectCombobox
            items={statusFilterItems}
            selected={(params.status as string[] | undefined) ?? []}
            onChange={(values) => setParam('status', values as GetRaffle200ItemsItemStatus[])}
            placeholder="Status"
            closeOnChange
            className="flex-1 lg:flex-auto"
          />
          <TagsFilter
            value={typeof params.tags === 'string' ? [params.tags] : (params.tags ?? [])}
            onChange={(values) => setParam('tags', values)}
          />
          <TokensFilter
            value={
              typeof params.tokenIds === 'string' ? [params.tokenIds] : (params.tokenIds ?? [])
            }
            onChange={(values) => setParam('tokenIds', values)}
          />
        </div>
        <div className="w-full lg:w-auto">
          <InputGroup className="max-w-full">
            <InputGroupInput
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <InputGroupAddon align="inline-end">
              <Button size="icon-xs" variant="ghost" onClick={onSearch}>
                <Search />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </>
  );
};
