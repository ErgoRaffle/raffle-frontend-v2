import Link from 'next/link';

import { Button, Typography } from '@ergo-raffle/ui-kit';

import { useWallet } from '@/hooks';

export const Agreement = () => {
  const wallet = useWallet();
  return (
    <>
      <Typography>
        By continuing, I agree to the Terms of{' '}
        <Link href="/terms" className="underline hover:text-secondary-1" target="_blank">
          Terms of Service
        </Link>
        .
      </Typography>
      <div className="flex justify-end mt-14">
        <Button variant="primary-soft" className="w-48" type="button" onClick={wallet.agree}>
          next
        </Button>
      </div>
    </>
  );
};
