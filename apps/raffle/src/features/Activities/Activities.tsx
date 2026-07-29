import { type GetActivityParams, getActivity } from '@ergo-raffle/client';
import { Card, CardContent, CardHeader, CardTitle, Empty, Typography } from '@ergo-raffle/ui-kit';

import { ActivityFilers } from './ActivitiesFilters';
import { ActivitiesPagination } from './ActivitiesPagination';
import { ActivityItem } from './ActivityItem';

type ActivityProps = {
  params?: GetActivityParams;
  address?: string;
};

export const Activities = async ({ params, address }: ActivityProps) => {
  const { items, total } = await getActivity({ ...params, address });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Typography variant="heading-1">My Activities</Typography>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ActivityFilers />
        {items.length <= 0 ? (
          <div className="flex justify-center items-center grow my-9">
            <Empty>
              <Typography variant="heading-3">No matching results found.</Typography>
            </Empty>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((activity) => (
              <ActivityItem activity={activity} key={activity.txId} />
            ))}
          </div>
        )}
        {!!total && <ActivitiesPagination total={total} />}
      </CardContent>
    </Card>
  );
};
