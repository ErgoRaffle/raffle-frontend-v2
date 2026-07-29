'use client';

import { createContext, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import type { NautilusWallet, NautilusWalletAddresses } from '@ergo-raffle/nautilus-wallet';
import type { XverseWallet, XverseWalletAddresses } from '@ergo-raffle/xverse-wallet';

import { type WalletInstance, type WalletName, wallets as walletInstances } from '@/lib';

export type WalletContextValue = {
  open: boolean;
  addresses?: {
    ergo?: NautilusWalletAddresses;
    bitcoin?: XverseWalletAddresses;
  };
  wallets: WalletInstance[];
  ergo?: NautilusWallet;
  bitcoin?: XverseWallet;
  connecting?: boolean;
  agreed?: boolean;
  connect: (name: WalletName) => Promise<void>;
  disconnect: (name: WalletName) => Promise<void>;
  openDialog: (names?: WalletName[]) => Promise<WalletInstance | undefined>;
  closeDialog: () => Promise<void>;
  agree: () => void;

  ensureConnected(name: 'Nautilus'): NautilusWallet;
  ensureConnected(name: 'Xverse'): XverseWallet;

  openActive: boolean;
  openActiveDialog: () => void;
  closeActiveDialog: () => void;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [openActive, setOpenActive] = useState(false);

  const [dialogResolver, setDialogResolver] = useState<((value?: WalletInstance) => void) | null>(
    null
  );

  const [addresses, setAddresses] = useState<WalletContextValue['addresses']>();
  const [connecting, setConnecting] = useState<boolean>();
  const [agreed, setAgreed] = useState<boolean>();
  const [ergoWallet, setErgoWallet] = useState<NautilusWallet>();
  const [bitcoinWallet, setBitcoinWallet] = useState<XverseWallet>();
  const [wallets, setWallets] = useState<WalletInstance[]>(walletInstances);

  const agree = useCallback(() => {
    setAgreed(true);
  }, []);

  const connect = useCallback(
    async (name: WalletName) => {
      const wallet = wallets.find((wallet) => wallet.name === name);

      if (!wallet) return;

      setConnecting(true);

      try {
        await wallet.connect();

        const addresses = await wallet.getAddresses();

        if (wallet.name === 'Nautilus') {
          setErgoWallet(wallet);
          setAddresses((prev) => ({
            ...prev,
            ergo: addresses as NautilusWalletAddresses
          }));
          localStorage.setItem('raffle:wallet:ergo', wallet.name);
        } else if (wallet.name === 'Xverse') {
          setBitcoinWallet(wallet as XverseWallet);
          setAddresses((prev) => ({
            ...prev,
            bitcoin: addresses as XverseWalletAddresses
          }));
          localStorage.setItem('raffle:wallet:bitcoin', wallet.name);
        }

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

  const disconnect = useCallback(
    async (name: WalletName) => {
      try {
        await bitcoinWallet?.disconnect();
        localStorage.removeItem('raffle:wallet:bitcoin');
        setBitcoinWallet(undefined);
        setAddresses((prev) => ({ ...prev, bitcoin: undefined }));
      } catch {
        //
      }

      if (name === 'Xverse') return;

      try {
        await ergoWallet?.disconnect();
        localStorage.removeItem('raffle:wallet:ergo');
        setErgoWallet(undefined);
        setAddresses((prev) => ({ ...prev, ergo: undefined }));
      } catch {
        //
      }
    },
    [bitcoinWallet, ergoWallet]
  );

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
      switch (name) {
        case 'Nautilus':
          if (!ergoWallet) {
            throw new Error(`Must be connected to ${name} wallet.`);
          }
          // biome-ignore lint/suspicious/noExplicitAny: make this better
          return ergoWallet as any;

        case 'Xverse':
          if (!bitcoinWallet) {
            throw new Error(`Must be connected to ${name} wallet.`);
          }
          // biome-ignore lint/suspicious/noExplicitAny: make this better
          return bitcoinWallet as any;

        default:
          throw new Error(`No wallet is connected.`);
      }
    },
    [ergoWallet, bitcoinWallet]
  );

  useEffect(() => {
    (async () => {
      setConnecting(true);

      const chains = ['ergo', 'bitcoin'] as const;

      for (const chain of chains) {
        const name = localStorage.getItem(`raffle:wallet:${chain}`);

        const wallet = walletInstances.find((wallet) => wallet.name === name);

        if (!wallet) continue;

        if (!wallet.isAvailable()) continue;

        if (!(await wallet.isConnected())) continue;

        try {
          await wallet.connect();

          const addresses = await wallet.getAddresses();

          setAddresses((prev) => ({ ...prev, [chain]: addresses }));

          if (wallet.name === 'Nautilus') {
            setErgoWallet(wallet as NautilusWallet);
          } else if (wallet.name === 'Xverse') {
            setBitcoinWallet(wallet as XverseWallet);
          }

          setAgreed(true);
        } catch {
          //
        }
      }

      setConnecting(false);
    })();
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      open,
      addresses,
      agreed,
      connecting,
      ergo: ergoWallet,
      bitcoin: bitcoinWallet,
      wallets,
      connect,
      disconnect,
      openDialog,
      agree,
      closeDialog,
      ensureConnected,
      openActive,
      openActiveDialog: () => setOpenActive(true),
      closeActiveDialog: () => setOpenActive(false)
    }),
    [
      open,
      addresses,
      agreed,
      agree,
      connecting,
      ergoWallet,
      bitcoinWallet,
      connect,
      disconnect,
      openDialog,
      ensureConnected,
      closeDialog,
      wallets,
      openActive
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
