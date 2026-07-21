import { Typography } from '@ergo-raffle/ui-kit';

import { WalletButton } from '@/components';

export const NoActiveWallet = () => (
  <div className="flex flex-col items-center justify-center space-y-4.5 text-center my-3">
    <div>
      <Typography variant="heading-2">No active Ergo wallet found.</Typography>
      <Typography variant="body-lg">Connect your Ergo wallet to proceed.</Typography>
    </div>
    <WalletButton />
  </div>
);
