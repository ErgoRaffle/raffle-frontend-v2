'use client';

import { Copy, Wallet as WalletIcon } from '@ergo-raffle/icons';
import { Button, Spinner, Tooltip, Typography } from '@ergo-raffle/ui-kit';

import { useWallet } from '@/hooks';

export const WalletButton = () => {
  const wallet = useWallet();

  return (
    <Tooltip
      content={
        <ul>
          {Object.keys(wallet.addresses || {}).map((chainKey) => {
            const chainAddresses =
              wallet.addresses?.[chainKey as keyof typeof wallet.addresses] || {};
            return (
              <li key={chainKey} className="mb-2">
                <div className="typo-heading-5">{chainKey.toUpperCase()}</div>
                <ul className="pl-4">
                  {Object.keys(chainAddresses).map((addressKey) => {
                    const address = chainAddresses[addressKey as keyof typeof chainAddresses];
                    return (
                      <li key={`${chainKey}:${addressKey}`} className="mb-2">
                        <b className="text-gray-1">{addressKey}:</b>
                        &nbsp;
                        {address}
                        &nbsp;
                        <Copy
                          className="align-middle inline-block w-[16px] cursor-pointer"
                          onClick={() => navigator.clipboard.writeText(address)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      }
      disabled={wallet.connecting || (!wallet.bitcoin && !wallet.ergo)}
    >
      <Button
        disabled={!!wallet.connecting}
        variant="outline-soft"
        onClick={() => {
          if (wallet.ergo) {
            wallet.openActiveDialog();
          } else {
            wallet.openDialog(['Nautilus']);
          }
        }}
      >
        <WalletIcon className="hidden lg:inline-flex" />
        {!!wallet.connecting && (
          <div className="flex items-center">
            <Spinner className="mx-2 size-6" />
            <Typography asChild variant="subtitle-sm" className="text-gray-2">
              <span>connecting...</span>
            </Typography>
          </div>
        )}
        {!wallet.connecting && (!!wallet.bitcoin || !!wallet.ergo) && (
          <div className="max-w-24 overflow-hidden flex items-center">
            <span className="shrink min-w-0 text-nowrap overflow-hidden text-ellipsis">
              {(
                Object.values(wallet.addresses?.ergo || wallet.addresses?.bitcoin || {}).join(
                  ', '
                ) ?? ''
              ).slice(0, -4)}
            </span>
            <span className="shrink-0">
              {(
                Object.values(wallet.addresses?.ergo || wallet.addresses?.bitcoin || {}).join(
                  ', '
                ) ?? ''
              ).slice(-4)}
            </span>
          </div>
        )}
        {!wallet.connecting && !wallet.bitcoin && !wallet.ergo && (
          <>
            <span className="hidden lg:inline-flex">Connect Wallet</span>
            <span className="lg:hidden">Set Wallet</span>
          </>
        )}
      </Button>
    </Tooltip>
  );
};
