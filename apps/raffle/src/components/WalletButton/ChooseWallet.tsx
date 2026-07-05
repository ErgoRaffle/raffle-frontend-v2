import { useState } from 'react';

import { WalletError } from '@ergo-raffle/base-wallet';
import { Right } from '@ergo-raffle/icons';
import { Button, Spinner, Typography, toast } from '@ergo-raffle/ui-kit';

import { useWallet } from '@/hooks';
import type { WalletName } from '@/lib';

export const ChooseWallet = () => {
  const wallet = useWallet();

  const [candidate, setCandidate] = useState<WalletName>();

  const handleConnect = (name: WalletName) => {
    setCandidate(name);
    wallet.connect(name).catch((error) => {
      toast.error('Failed to connect wallet.', {
        description: error instanceof WalletError ? error.message : undefined,
        errorDetails: error instanceof WalletError ? undefined : error
      });
      wallet.closeDialog();
    });
  };

  return (
    <>
      {wallet.wallets.map((item) => (
        <button
          className="flex items-center justify-between bg-gray-5 rounded-lg p-2.5 disabled:opacity-50 cursor-pointer border border-transparent hover:border-gray-4"
          disabled={!!wallet.connecting}
          key={item.name}
          type="button"
          onClick={() => handleConnect(item.name as WalletName)}
        >
          <div className="flex items-center gap-3">
            <div className="size-6">
              <item.iconReact />
            </div>
            <Typography variant="subtitle-lg" className="flex items-center">
              {item.name}{' '}
              {wallet.connecting && candidate === item.name ? (
                <>
                  <Spinner className="ml-2 mr-1 size-4" />
                  <Typography asChild variant="subtitle-sm" className="text-gray-2">
                    <span>connecting...</span>
                  </Typography>
                </>
              ) : (
                ''
              )}
            </Typography>
          </div>
          {wallet.selected?.name === item.name ? (
            <Button
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                wallet.disconnect(item.name);
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Right className="size-6 my-2" />
          )}
        </button>
      ))}
    </>
  );
};
