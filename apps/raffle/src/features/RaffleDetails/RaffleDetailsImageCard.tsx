import Image from 'next/image';

import { GetRaffle200ItemsItemStatus } from '@ergo-raffle/client';
import {
  Badge,
  Card,
  CardAction,
  CardContent,
  CardImageWrapper,
  Identifier,
  Skeleton,
  Typography
} from '@ergo-raffle/ui-kit';

import { getAddressUrl } from '@/lib';

import { raffleStatusMap } from '../raffleStatusRenderMap';
import { RaffleDetailsImageCarousel } from './RaffleDetailsImageCarousel';
import { RaffleVoteCard } from './RaffleVoteCard';
import type { RaffleDetailView } from './raffleToViewModel';

export type RaffleDetailsImageCardProps = {
  loading?: boolean;
  raffle?: RaffleDetailView;
};

export const RaffleDetailsImageCard = ({ loading, raffle }: RaffleDetailsImageCardProps) => (
  <Card className="w-full lg:w-125 order-2 lg:order-1 p-0 lg:min-h-130" border={false} shadow>
    {loading ? (
      <CardImageWrapper loading={loading} />
    ) : raffle?.pictures?.length ? (
      <RaffleDetailsImageCarousel pictures={raffle.pictures} placeholder={raffle.name} />
    ) : (
      <CardImageWrapper>
        <Image
          src="/illustrations/imagePlaceholderIllustration.svg"
          priority
          alt="Raffle"
          className="w-full object-contain rounded-tl-md rounded-tr-md"
          fill
          sizes="(max-width: 1024px) 100vw,33vw"
        />
      </CardImageWrapper>
    )}
    {!loading && raffle?.status && raffle?.status !== GetRaffle200ItemsItemStatus.active && (
      <CardAction>
        <Badge variant={raffleStatusMap[raffle.status]?.variant || 'white-outline'} size="sm">
          {raffleStatusMap[raffle.status]?.label || raffle?.status}
        </Badge>
      </CardAction>
    )}
    <CardContent className="flex flex-col gap-1.5 p-0 justify-stretch grow">
      <Card border={false}>
        <CardContent className="flex flex-col">
          <div className="flex items-center justify-between text-black-1">
            <Typography variant="heading-5" asChild>
              <span>Mission fund:</span>
            </Typography>
            {loading ? (
              <Skeleton className="h-2 w-10" />
            ) : (
              <Typography variant="heading-3" asChild>
                <span>{raffle?.missionFund || 0}%</span>
              </Typography>
            )}
          </div>
          <div className="flex items-center justify-between text-gray-1">
            <Typography variant="subtitle-lg" asChild>
              <span>Address:</span>
            </Typography>
            <div className="w-1/2">
              <Identifier
                value={raffle?.addresses.project}
                href={getAddressUrl(raffle?.addresses.project)}
                size="lg"
                loading={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card border={false}>
        <CardContent className="flex flex-col">
          <div className="flex items-center justify-between text-black-1">
            <Typography variant="heading-5" asChild>
              <span>Winners Pot:</span>
            </Typography>
            {loading ? (
              <Skeleton className="h-2 w-10" />
            ) : (
              <Typography variant="heading-3" asChild>
                <span>{raffle?.winnerPotSharePercent || 0}%</span>
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>
      <Card border={false}>
        <CardContent className="flex flex-col">
          <div className="flex items-center justify-between text-black-1">
            <Typography variant="heading-5" asChild>
              <span>Protocol fee</span>
            </Typography>
            {loading ? (
              <Skeleton className="h-2 w-10" />
            ) : (
              <Typography variant="heading-3" asChild>
                <span>{raffle?.serviceFee || 0}%</span>
              </Typography>
            )}
          </div>
        </CardContent>
      </Card>
      <RaffleVoteCard loading={loading} raffle={raffle} voteCount={0} />
    </CardContent>
  </Card>
);
