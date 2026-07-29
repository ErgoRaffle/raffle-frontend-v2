'use client';

import type { GetActivity200ItemsItem } from '@ergo-raffle/client';
import { Card, CardContent, Identifier, Skeleton, Typography } from '@ergo-raffle/ui-kit';

import { activityRenderMap } from '@/features/activityRenderMap';
import { formatDateTime, getTxURL } from '@/lib';

export type RaffleActivityItemProps = {
  activity?: GetActivity200ItemsItem;
  loading?: boolean;
  isUserAddress?: boolean;
};

export const RaffleActivityItem = ({
  activity,
  loading,
  isUserAddress
}: RaffleActivityItemProps) => {
  const config = activity ? activityRenderMap[activity.type] : undefined;

  return (
    <div className="flex items-stretch space-x-2">
      <Card padding="xs" className={`sm:flex-2 ${isUserAddress ? 'bg-secondary-6' : ''}`}>
        <CardContent className="flex items-center space-x-1 my-auto">
          {loading ? (
            <>
              <Skeleton className="size-6" />
              <Skeleton className="w-20 h-3 hidden sm:block" />
            </>
          ) : (
            <>
              {config?.icon}
              <Typography
                variant="body-md"
                className="hidden sm:block text-nowrap overflow-hidden text-ellipsis"
              >
                {config?.shortText(activity)}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
      <Card padding="xs" className={`grow sm:flex-4 ${isUserAddress ? 'bg-secondary-6' : ''}`}>
        <CardContent className="flex items-center justify-between space-x-1 text-gray-2 my-auto">
          <div className="max-w-40 xl:max-w-70">
            {loading ? (
              <Skeleton className="h-2 w-40" />
            ) : (
              <Identifier
                size="lg"
                value={activity?.address}
                className="mr-2"
                href={getTxURL(activity?.txId)}
              />
            )}
          </div>
          {loading ? (
            <Skeleton className="h-1.5 w-10" />
          ) : (
            <Typography variant="subtitle-sm">
              {activity?.timestamp ? formatDateTime(activity.timestamp * 1000) : ''}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
