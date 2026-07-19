'use client';

import { createContext, type ReactNode, useCallback, useState } from 'react';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormReturn, useForm } from 'react-hook-form';

import type { GetRaffleRaffleId200, GetTokensBridgeable200 } from '@ergo-raffle/client';
import { toast } from '@ergo-raffle/ui-kit';

import { getInfo, getTokensBridgeable } from '@/actions';
import { type RaffleDonateForm, raffleDonateSchema } from '@/features/schemas';
import { donateRaffle } from '@/features/services';
import { useWallet } from '@/hooks';
import {
  getTxURL,
  getTxURLForRunes,
  saveTransactionId,
  type WalletInstance,
  type WalletName
} from '@/lib';

export type DonateContextValue = {
  donateForm: UseFormReturn<RaffleDonateForm>;
  ticketCount: number;
  onDonateFormSubmit: () => void;
  selectNetwork: (value: Network) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  donateTransactionId?: string;
  bridgeableData?: GetTokensBridgeable200;
  siteKey?: string;
  setRecaptcha: (value?: string) => void;
  submitDonation: (walletInstance?: WalletInstance, address?: string) => Promise<void>;
  isSelectNetworkDialogOpen: boolean;
  setIsSelectNetworkDialogOpen: (value: boolean) => void;
  isFallbackDialogOpen: boolean;
  setIsFallbackDialogOpen: (value: boolean) => void;
  agreementDialogOpen: boolean;
  setAgreementDialogOpen: (value: boolean) => void;
  agreementChecked: boolean;
  setAgreementChecked: (value: boolean) => void;
};

export type DonateProviderProps = {
  children: ReactNode;
  raffle: GetRaffleRaffleId200;
};

export type Network = 'ergo' | 'bitcoin';

export const DonateContext = createContext<DonateContextValue | null>(null);

export const DonateProvider = ({ children, raffle }: DonateProviderProps) => {
  const wallet = useWallet();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bridgeableData, setBridgeableData] = useState<GetTokensBridgeable200>();
  const [isSelectNetworkDialogOpen, setIsSelectNetworkDialogOpen] = useState<boolean>(false);
  const [donateTransactionId, setDonateTransactionId] = useState<string>();
  const [siteKey, setSiteKey] = useState<string>();
  const [recaptcha, setRecaptcha] = useState<string>();
  const [network, setNetwork] = useState<'ergo' | 'bitcoin'>();
  const [isFallbackDialogOpen, setIsFallbackDialogOpen] = useState<boolean>(false);
  const [agreementDialogOpen, setAgreementDialogOpen] = useState<boolean>(false);
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);

  const donateForm = useForm<RaffleDonateForm>({
    resolver: zodResolver(raffleDonateSchema),
    defaultValues: { terms: false }
  });

  const load = useCallback(() => {
    setIsLoading(true);

    setBridgeableData(undefined);

    Promise.all([getTokensBridgeable({ tokenId: raffle.token.id }), getInfo()])
      .then(([bridgeableResponse, infoResponse]) => {
        setBridgeableData(bridgeableResponse);
        setSiteKey(infoResponse.siteKey);
      })
      .catch((error) => {
        toast.error('Failed to load donation data.', { errorDetails: error });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [raffle]);

  const resetForm = useCallback(() => {
    setTimeout(() => {
      setDonateTransactionId(undefined);
      donateForm.reset();
    }, 5000);
  }, [donateForm.reset]);

  const selectNetwork = (network: Network) => {
    setNetwork(network);

    const names: WalletName[] = [];

    if (network === 'ergo') {
      names.push('Nautilus');
    }
    if (network === 'bitcoin' && bridgeableData?.bridgeable) {
      names.push('Xverse');
    }

    setIsSelectNetworkDialogOpen(false);

    wallet
      .openDialog(names)
      .then(async (walletInstance) => {
        if (!walletInstance) {
          await wallet.closeDialog();
          setNetwork(undefined);
        }
        if (walletInstance?.name === 'Nautilus') {
          setAgreementDialogOpen(true);
        }
        if (walletInstance?.name === 'Xverse') {
          setAgreementDialogOpen(true);
        }
      })
      .finally(() => {
        setIsSelectNetworkDialogOpen(false);
      });
  };

  const submitDonation = useCallback(
    async (walletInstance?: WalletInstance, address?: string) => {
      try {
        setIsSelectNetworkDialogOpen(false);

        setIsSubmitting(true);

        const txId = await donateRaffle(
          raffle.id,
          {
            tickets: donateForm.getValues().tickets,
            recaptcha,
            isBridgeable: bridgeableData?.bridgeable,
            ergoAddress: address
          },
          walletInstance || wallet.selected
        );

        const url = network === 'bitcoin' ? getTxURLForRunes(txId) : getTxURL(txId);

        toast.success('Raffle donated successfully!', {
          description: (
            <>
              Click{' '}
              <Link className="text-primary-1" href={url || ''} target="_blank">
                here
              </Link>{' '}
              to see details.
            </>
          )
        });

        saveTransactionId(txId);

        setDonateTransactionId(txId);

        resetForm();

        setIsFallbackDialogOpen(false);
      } catch (error) {
        toast.error('Failed to donate raffle. Please try again later.', { errorDetails: error });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      donateForm.getValues,
      raffle,
      recaptcha,
      resetForm,
      wallet,
      bridgeableData?.bridgeable,
      network
    ]
  );

  const onDonateFormSubmit = () => {
    setNetwork(undefined);
    setBridgeableData(undefined);
    setIsSelectNetworkDialogOpen(true);
    load();
  };

  const value: DonateContextValue = {
    donateForm,
    ticketCount: donateForm.getValues('tickets'),
    onDonateFormSubmit,
    selectNetwork,
    isSubmitting,
    isLoading,
    donateTransactionId,
    bridgeableData,
    setRecaptcha,
    siteKey,
    submitDonation,
    isSelectNetworkDialogOpen: !wallet.open && isSelectNetworkDialogOpen,
    setIsSelectNetworkDialogOpen: (open) => !open && setIsSelectNetworkDialogOpen(false),
    isFallbackDialogOpen,
    setIsFallbackDialogOpen,
    agreementDialogOpen,
    setAgreementDialogOpen,
    agreementChecked,
    setAgreementChecked
  };

  return <DonateContext.Provider value={value}>{children}</DonateContext.Provider>;
};
