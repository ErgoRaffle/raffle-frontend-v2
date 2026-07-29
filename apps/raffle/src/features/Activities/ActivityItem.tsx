import Link from 'next/link';

import type { GetActivity200ItemsItem } from '@ergo-raffle/client';
import { Card, CardContent, Skeleton, Typography } from '@ergo-raffle/ui-kit';

import { activityRenderMap, activityStatusRenderMap } from '@/features/activityRenderMap';
import { formatDateTime, getTxURL } from '@/lib';

export type ActivityItemProps = { activity?: GetActivity200ItemsItem; loading?: boolean };

export const ActivityItem = ({ activity, loading }: ActivityItemProps) => {
  const config = activity ? activityRenderMap[activity.type] : undefined;

  return (
    <Link className="block" href={getTxURL(activity?.txId) || ''} target="_blank">
      <Card padding="xs">
        <CardContent className="flex items-center space-x-3 my-auto">
          {loading ? (
            <Skeleton className="size-10 rounded-full" />
          ) : (
            <div className="rounded-full bg-gray-5 size-10 min-w-10 flex items-center justify-center">
              {config?.icon}
            </div>
          )}
          <div className="grow">
            {loading ? (
              <Skeleton className="h-2 w-20 sm:w-50 mb-2" />
            ) : (
              <Typography variant="heading-5" className="text-nowrap overflow-hidden text-ellipsis">
                {config?.text(activity)}
              </Typography>
            )}
            <div className="flex justify-between">
              {loading ? (
                <Skeleton className="h-1.5 w-10 sm:w-20" />
              ) : activity?.status ? (
                <Typography
                  variant="subtitle-md"
                  className={activityStatusRenderMap[activity.status].color}
                >
                  {activityStatusRenderMap[activity.status].text}
                </Typography>
              ) : null}
              {loading ? (
                <Skeleton className="h-1.5 w-10" />
              ) : (
                <Typography variant="subtitle-sm" className="text-gray-2">
                  {activity?.timestamp ? formatDateTime(activity.timestamp * 1000) : ''}
                </Typography>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
