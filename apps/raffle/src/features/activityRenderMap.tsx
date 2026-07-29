import type {
  GetActivity200ItemsItem,
  GetActivity200ItemsItemStatus,
  GetActivity200ItemsItemType
} from '@ergo-raffle/client';
import { Gift, Spark, Ticket } from '@ergo-raffle/icons';
import { BasketStatus } from '@ergo-raffle/ui-kit';

export const activityRenderMap: Record<
  GetActivity200ItemsItemType,
  {
    icon: React.ReactNode;
    shortText: (activity?: GetActivity200ItemsItem) => string;
    text: (activity?: GetActivity200ItemsItem) => string;
  }
> = {
  creation: {
    icon: <Spark className="size-6 min-w-6" />,
    shortText: () => 'Raffle created',
    text: (activity?: GetActivity200ItemsItem) =>
      `Raffle “${activity?.raffleName ?? ''}” is created`
  },

  donation: {
    icon: <Ticket className="size-6 min-w-6" />,
    shortText: (activity?: GetActivity200ItemsItem) =>
      `${activity?.ticketCount ?? ''} Ticket bought`,
    text: (activity?: GetActivity200ItemsItem) => `${activity?.ticketCount ?? ''} Ticket bought`
  },
  gift: {
    icon: <Gift className="size-6 min-w-6" />,
    shortText: () => 'Gift added',
    text: (activity?: GetActivity200ItemsItem) =>
      `Gift added to “${activity?.raffleName ?? ''}” Raffle`
  },
  gift_return: {
    icon: <Gift className="size-6 min-w-6" />,
    shortText: () => 'Gift returned',
    text: (activity?: GetActivity200ItemsItem) =>
      `Gift returned from “${activity?.raffleName ?? ''}” Raffle`
  },
  ticket_redeem: {
    icon: <BasketStatus className="size-6 min-w-6" />,
    shortText: () => 'Ticket redeemed',
    text: (activity?: GetActivity200ItemsItem) =>
      `“Ticket redeemed for ${activity?.raffleName ?? ''}” Raffle`
  }
} as const;

export const activityStatusRenderMap: Record<
  GetActivity200ItemsItemStatus,
  {
    color: string;
    text: string;
  }
> = {
  success: {
    color: 'text-success',
    text: 'Successful'
  },

  pending: {
    color: 'text-gray-2',
    text: 'In progress'
  },

  failed: {
    color: 'text-alert',
    text: 'Took too long'
  }
} as const;
