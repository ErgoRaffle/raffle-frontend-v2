'use client';

import type {
  GetRaffleRaffleIdBasket200ItemsItem,
  GetTokens200ItemsItem
} from '@ergo-raffle/client';
import { Right } from '@ergo-raffle/icons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Empty,
  Skeleton,
  Typography
} from '@ergo-raffle/ui-kit';

import { getDecimalString } from '@/lib';

import type { RaffleDetailView } from '../raffleToViewModel';
import { GiftItem } from './GiftItem';
import { RaffleWinnerBasketTransactions } from './RaffleWinnerBasketTransactions';

export type RaffleWinnerBasketInfoDialogProps = {
  basket?: GetRaffleRaffleIdBasket200ItemsItem;
  basketLoading?: boolean;
  raffle: RaffleDetailView;
  giftTokens?: GetTokens200ItemsItem[];
};

export const RaffleWinnerBasketInfo = ({
  basket,
  raffle,
  basketLoading = true,
  giftTokens
}: RaffleWinnerBasketInfoDialogProps) => (
  <div className="space-y-3">
    {basketLoading ? (
      <>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-12.5 w-full" />
        <Skeleton className="h-12.5 w-full" />
      </>
    ) : (
      basket && (
        <>
          <Typography variant="body-lg">
            {basket.share / 10}% Share of the winners Pot{' '}
            <Typography variant="subtitle-md" asChild>
              <span>
                (
                {!!(raffle?.winnerPotShareAmount && raffle.token?.decimals) &&
                  getDecimalString(
                    Math.round((raffle.winnerPotShareAmount * basket.share) / 100),
                    raffle.token.decimals
                  )}{' '}
                {raffle?.token.name})
              </span>
            </Typography>
          </Typography>
          {basket.gifts ? (
            <Collapsible className="rounded-sm data-[state=open]:bg-gray-5">
              <CollapsibleTrigger asChild>
                <div className="flex justify-between  border border-gray-5 rounded-sm p-3 group data-[state=open]:border-0 cursor-pointer hover:border-gray-4">
                  <Typography variant="body-lg">{basket.gifts.length} Additional Gifts</Typography>
                  <Right className="size-5 group-data-[state=open]:rotate-90" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-2">
                <div className="bg-white-1 text-white-1-foreground px-2 py-1.5 rounded-sm">
                  {basket.gifts.length ? (
                    basket.gifts.map((gift, index) => {
                      const giftToken = giftTokens?.find((t) => t.id === gift.tokenId);
                      return (
                        <GiftItem
                          gift={gift}
                          key={`${index.toString()}-${gift.amount}`}
                          giftToken={giftToken}
                        />
                      );
                    })
                  ) : (
                    <Empty>
                      <Typography variant="heading-3">No matching results found.</Typography>
                    </Empty>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
          <RaffleWinnerBasketTransactions basket={basket} raffle={raffle} />
        </>
      )
    )}
  </div>
);
