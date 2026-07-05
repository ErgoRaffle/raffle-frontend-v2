'use client';

import { Badge, BasketStatus } from '@ergo-raffle/ui-kit';

import type { WinnerBasketsTypeFilter } from '@/hooks';

import type { RaffleDetailView } from '../raffleToViewModel';

export type RaffleWinnerBasketsFiltersProps = {
  isLoading?: boolean;
  raffle: RaffleDetailView;
  type?: WinnerBasketsTypeFilter;
  onTypeFilterChange: (type: WinnerBasketsTypeFilter) => void;
};

export const RaffleWinnerBasketsFilters = ({
  isLoading,
  raffle,
  type,
  onTypeFilterChange
}: RaffleWinnerBasketsFiltersProps) => (
  <div className="space-x-2 space-y-2">
    {raffle.winnerPotSharePercent !== 0 && (
      <Badge
        variant={type === 'share' ? 'secondary' : 'elevated'}
        size="lg"
        className="cursor-pointer"
        onClick={() => onTypeFilterChange('share')}
        aria-disabled={isLoading}
      >
        <BasketStatus filled />
        Share
      </Badge>
    )}
    <Badge
      variant={type === 'empty' ? 'secondary' : 'elevated'}
      size="lg"
      className="cursor-pointer"
      onClick={() => onTypeFilterChange('empty')}
      aria-disabled={isLoading}
    >
      <BasketStatus />
      Empty
    </Badge>
    <Badge
      variant={type === 'gift' ? 'secondary' : 'elevated'}
      size="lg"
      className="cursor-pointer"
      onClick={() => onTypeFilterChange('gift')}
      aria-disabled={isLoading}
    >
      <BasketStatus hasGift />
      Gift
    </Badge>
    {raffle.winnerPotSharePercent !== 0 && (
      <Badge
        variant={type === 'share-gift' ? 'secondary' : 'elevated'}
        size="lg"
        className="cursor-pointer"
        onClick={() => onTypeFilterChange('share-gift')}
        aria-disabled={isLoading}
      >
        <BasketStatus filled hasGift />
        Share + Gift
      </Badge>
    )}
  </div>
);
