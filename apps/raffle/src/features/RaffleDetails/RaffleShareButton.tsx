'use client';

import { Share } from '@ergo-raffle/icons';
import { Button, Skeleton, toast } from '@ergo-raffle/ui-kit';

export type RaffleShareButtonProps = { loading?: boolean };

export const RaffleShareButton = ({ loading }: RaffleShareButtonProps) => {
  const url = typeof window === 'undefined' ? '' : window.location.href;

  const handleCopy = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('The page link is copied!');
    });
  };

  const handleShareClick = async () => {
    try {
      const shareData = { url };
      await navigator.share(shareData);
    } catch {
      handleCopy();
    }
  };

  return loading ? (
    <Skeleton className="rounded-full size-12" />
  ) : (
    <>
      <Button variant="rounded" size="icon" className="hidden sm:flex" onClick={handleShareClick}>
        <Share />
      </Button>
      <Button variant="plain" size="icon" className="sm:hidden" onClick={handleShareClick}>
        <Share />
      </Button>
    </>
  );
};
