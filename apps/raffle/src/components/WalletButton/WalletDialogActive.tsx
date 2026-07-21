'use client';

import { BitcoinRunes, Copy, Ergo } from '@ergo-raffle/icons';
import {
  Button,
  Field,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  toast
} from '@ergo-raffle/ui-kit';

import { useWallet } from '@/hooks';

import { ConnectWalletDialog } from './ConnectWalletDialog';

export const WalletDialogActive = () => {
  const wallet = useWallet();

  const handleCopy = (address: string) => {
    if (!address) return;

    navigator.clipboard
      .writeText(address)
      .then(() => {
        toast.success('Address copied to clipboard');
      })
      .catch(() => undefined);
  };

  return (
    <ConnectWalletDialog
      open={wallet.openActive}
      onOpenChange={(isOpen) => !isOpen && wallet.closeActiveDialog()}
      title="Active Wallet"
    >
      {!!wallet.ergo && (
        <>
          <Field>
            <FieldLabel>Ergo Wallet:</FieldLabel>
            <InputGroup variant="bordered">
              <InputGroupInput value={wallet.addresses?.ergo?.main} />
              <InputGroupAddon align="inline-start">
                <Ergo className="size-6 text-gray-1" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <Button
                  variant="plain"
                  size="icon-xs"
                  onClick={() => handleCopy(wallet.addresses?.ergo?.main || '')}
                >
                  <Copy />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Button
            variant="error"
            onClick={() => {
              wallet.disconnect('Nautilus');
              wallet.closeActiveDialog();
            }}
          >
            Disconnect
          </Button>
        </>
      )}
      {!!wallet.bitcoin && !!wallet.ergo && <span className="border-t border-t-gray-5" />}
      {!!wallet.bitcoin && (
        <>
          <Field>
            <FieldLabel>Bitcoin Wallet:</FieldLabel>
            <InputGroup variant="bordered">
              <InputGroupInput value={wallet.addresses?.bitcoin?.nativeSegWit} />
              <InputGroupAddon align="inline-start">
                <BitcoinRunes className="size-6 text-gray-1" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <Button
                  variant="plain"
                  size="icon-xs"
                  onClick={() => handleCopy(wallet.addresses?.bitcoin?.nativeSegWit || '')}
                >
                  <Copy />
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Button
            variant="error"
            onClick={() => {
              wallet.disconnect('Xverse');
              wallet.closeActiveDialog();
            }}
          >
            Disconnect
          </Button>
        </>
      )}
    </ConnectWalletDialog>
  );
};
