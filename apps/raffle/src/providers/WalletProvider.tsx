'use client';

import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import type { NautilusWallet } from '@ergo-raffle/nautilus-wallet';
import type { XverseWallet } from '@ergo-raffle/xverse-wallet';

import { type WalletInstance, type WalletName, wallets as walletInstances } from '@/lib';

export type WalletContextValue = {
  open: boolean;
  addresses?: Record<string, string>;
  wallets: WalletInstance[];
  selected?: WalletInstance;
  connecting?: boolean;
  agreed?: boolean;
  connect: (name: WalletName | undefined) => Promise<void>;
  disconnect: (name: WalletName) => Promise<void>;
  openDialog: (names?: WalletName[]) => Promise<WalletInstance | undefined>;
  closeDialog: () => Promise<void>;
  agree: () => void;

  ensureConnected(name: 'Nautilus'): NautilusWallet;
  ensureConnected(name: 'Xverse'): XverseWallet;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  const [dialogResolver, setDialogResolver] = useState<((value?: WalletInstance) => void) | null>(
    null
  );

  const [addresses, setAddresses] = useState<Record<string, string>>();
  const [connecting, setConnecting] = useState<boolean>();
  const [agreed, setAgreed] = useState<boolean>();
  const [selected, setSelected] = useState<WalletInstance>();
  const [wallets, setWallets] = useState<WalletInstance[]>(walletInstances);

  const agree = useCallback(() => {
    setAgreed(true);
  }, []);

  const connect = useCallback(
    async (name?: WalletName) => {
      setSelected(undefined);

      const wallet = wallets.find((wallet) => wallet.name === name);

      if (!wallet) return;

      setConnecting(true);

      try {
        await wallet.connect();

        const addresses = await wallet.getAddresses();

        setAddresses(addresses);

        setSelected(wallet);

        localStorage.setItem('raffle:wallet', wallet.name);

        setOpen(false);

        dialogResolver?.(wallet);
        setDialogResolver(null);
      } catch (error) {
        dialogResolver?.(undefined);
        setDialogResolver(null);

        throw error;
      } finally {
        setConnecting(false);
      }
    },
    [dialogResolver, wallets]
  );

  const disconnect = useCallback(async () => {
    if (!selected) return;

    selected
      .disconnect()
      .then(() => {
        setSelected(undefined);
        localStorage.removeItem('raffle:wallet');
      })
      .catch(() => undefined);
  }, [selected]);

  const openDialog = useCallback(
    async (names?: WalletName[]): Promise<WalletInstance | undefined> => {
      setWallets(walletInstances.filter((wallet) => !names || names.includes(wallet.name)));
      setOpen(true);
      return new Promise<WalletInstance | undefined>((resolve) => {
        setDialogResolver(() => resolve);
      });
    },
    []
  );

  const closeDialog = useCallback(async () => {
    setOpen(false);
    dialogResolver?.(undefined);
    setDialogResolver(null);
  }, [dialogResolver]);

  const ensureConnected = useCallback(
    (name: WalletName) => {
      if (selected?.name !== name) {
        throw new Error(`Must be connected to ${name} wallet.`);
      }

      if (!selected) {
        throw new Error(`No wallet is connected.`);
      }

      // biome-ignore lint/suspicious/noExplicitAny: make this better
      return selected as any;
    },
    [selected]
  );

  useEffect(() => {
    (async () => {
      const name = localStorage.getItem('raffle:wallet');

      const wallet = walletInstances.find((wallet) => wallet.name === name);

      if (!wallet) return;

      if (!wallet.isAvailable()) return;

      setConnecting(true);

      if (!(await wallet.isConnected())) {
        setConnecting(false);

        return;
      }

      try {
        await wallet.connect();

        const addresses = await wallet.getAddresses();

        setAddresses(addresses);

        setSelected(wallet);

        setAgreed(true);
      } catch {
        //
      }

      setConnecting(false);
    })();
  }, []);

  const value = useMemo(
    () => ({
      open,
      addresses,
      agreed,
      connecting,
      selected,
      wallets,
      connect,
      disconnect,
      openDialog,
      agree,
      closeDialog,
      ensureConnected
    }),
    [
      open,
      addresses,
      agreed,
      agree,
      connecting,
      selected,
      connect,
      disconnect,
      openDialog,
      ensureConnected,
      closeDialog,
      wallets
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
