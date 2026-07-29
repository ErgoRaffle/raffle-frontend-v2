'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';

import { WalletError, type WalletToken } from '@ergo-raffle/base-wallet';
import { Dice, UpLeft } from '@ergo-raffle/icons';
import {
  BasketStatus,
  Button,
  Field,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Spinner,
  Token,
  Typography,
  toast
} from '@ergo-raffle/ui-kit';

import type { RaffleDetailView } from '@/features/RaffleDetails/raffleToViewModel';
import { type AddGiftForm, addGiftSchema } from '@/features/schemas';
import { addGiftRaffle } from '@/features/services';
import { useWallet } from '@/hooks';
import { getDecimalString, getNonDecimalString, getTxURL, saveTransactionId } from '@/lib';

import { AssetsField } from './AssetsField';

export type RaffleAddGiftFormProps = {
  initialBasketNumber?: number;
  basketsCount?: number;
  onCloseDialog: () => void;
  raffle: RaffleDetailView;
};

export const RaffleAddGiftForm = ({
  initialBasketNumber,
  basketsCount,
  raffle,
  onCloseDialog
}: RaffleAddGiftFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
    control,
    setValue
  } = useForm<AddGiftForm>({
    resolver: zodResolver(addGiftSchema),
    defaultValues: {
      winnerIndex: initialBasketNumber,
      tokens: []
    }
  });
  const { fields: tokenFields } = useFieldArray({
    control,
    name: 'tokens'
  });

  const wallet = useWallet();

  const [assets, setAssets] = useState<(WalletToken & { balance?: string })[]>([]);

  const load = useCallback(async () => {
    if (wallet.ergo?.name !== 'Nautilus') {
      throw new Error('Must be connected to Nautilus wallet.');
    }

    const tokens = await wallet.ergo.fetchTokens();

    const promises = tokens.map((token) => wallet.ergo?.fetchBalance(token.id));

    const balances = await Promise.all(promises);

    const result = tokens.map((token, index) => ({ ...token, balance: balances[index] }));

    return result;
  }, [wallet.ergo]);

  useEffect(() => {
    load()
      .then((result) => {
        setAssets(result);
      })
      .catch((error) => {
        toast.error('Something went wrong with loading wallet data! Please try again later.', {
          errorDetails: error
        });
      });
  }, [load]);

  const setRandomBasket = () => {
    if (basketsCount && basketsCount > 0) {
      setValue('winnerIndex', Math.floor(Math.random() * basketsCount));
    }
  };

  const onSubmit = async (data: AddGiftForm) => {
    const winnerIndex = data.winnerIndex;

    try {
      setIsLoading(true);

      const tokens = data.tokens.map((token) => {
        const amount = token.amount.toLocaleString('en', {
          useGrouping: false,
          minimumFractionDigits: 1,
          maximumFractionDigits: 20
        });

        const decimal = assets.find((asset) => asset.id === token.tokenId)?.decimals || 0;

        const value = getNonDecimalString(amount, decimal);

        return {
          amount: BigInt(Number(value)),
          tokenId: token.tokenId
        };
      });

      const txId = await addGiftRaffle(raffle.id, { winnerIndex, tokens }, wallet);

      toast.success('Gifts added successfully!', {
        description: (
          <>
            Click{' '}
            <Link className="text-primary-1" href={getTxURL(txId) || ''} target="_blank">
              here
            </Link>{' '}
            to see details.
          </>
        )
      });
      saveTransactionId(txId);
      onCloseDialog();
    } catch (error) {
      toast.error('Failed to add Gift.', {
        description: error instanceof WalletError ? error.message : undefined,
        errorDetails: error instanceof WalletError ? undefined : error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex items-end space-x-2">
        <Field>
          <FieldLabel>Number of baskets</FieldLabel>
          <InputGroup variant="bordered">
            <InputGroupInput
              min={1}
              aria-invalid={!!errors.winnerIndex}
              {...register('winnerIndex', {
                setValueAs: (v) => (v === '' ? undefined : Number(v))
              })}
              type="number"
            />
            <InputGroupAddon align="inline-start">
              <BasketStatus filled hasGift className="size-6" />
            </InputGroupAddon>
          </InputGroup>
          {!!errors.winnerIndex && <FieldError>{errors.winnerIndex.message}</FieldError>}
        </Field>
        <Button variant="plain" type="button" onClick={setRandomBasket}>
          <Dice className="size-6" />
          Random Basket
        </Button>
      </div>
      <div className="mt-2">
        <Typography variant="heading-5">Choose assets</Typography>
        <Typography variant="heading-5" className="text-gray-2">
          They will all be added to Basket #{watch('winnerIndex')} as one Gift
        </Typography>
      </div>
      <Field>
        <AssetsField
          tokens={assets}
          values={watch('tokens') ?? []}
          onValueChange={(val) => {
            setValue('tokens', val, {
              shouldValidate: true,
              shouldDirty: true
            });
          }}
        />
        {!!errors.tokens && (
          <FieldError>{errors.tokens.message || errors.tokens?.root?.message}</FieldError>
        )}
      </Field>
      <div className="min-h-36 md:min-h-auto max-h-36 overflow-y-auto scrollbar-hide space-y-4">
        {tokenFields.map((asset, index) => (
          <Field key={asset.id}>
            <Token
              name={assets.find((i) => i.id === asset.tokenId)?.name}
              tokenId={asset.id}
              size="lg"
            />
            <div className="flex items-center space-x-2">
              <InputGroup variant="bordered" size="sm">
                <InputGroupInput
                  type="number"
                  step="any"
                  aria-invalid={!!errors.tokens && !!errors.tokens[index]?.amount}
                  {...register(`tokens.${index}.amount`, {
                    setValueAs: (v) => (v === '' ? undefined : Number(v))
                  })}
                />
                <InputGroupAddon align="inline-end">
                  <Typography variant="subtitle-md" className="text-gray-3" asChild>
                    <span className="flex items-center space-x-1">
                      {getDecimalString(
                        assets.find((i) => i.id === asset.tokenId)?.balance,
                        assets.find((i) => i.id === asset.tokenId)?.decimals
                      )}{' '}
                      <UpLeft className="size-4" />
                    </span>
                  </Typography>
                </InputGroupAddon>
              </InputGroup>
              {/* <Typography variant="subtitle-sm" className="text-gray-3 whitespace-nowrap" asChild>
                <span>≈ 86 USDT</span>
              </Typography> */}
            </div>
            {!!errors.tokens && errors.tokens[index]?.amount && (
              <FieldError>{errors.tokens[index]?.amount?.message}</FieldError>
            )}
          </Field>
        ))}
      </div>

      <div className="mt-4 flex flex-col">
        <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
          {!!isLoading && <Spinner className="size-7" />}
          Add Gift
        </Button>
      </div>
    </form>
  );
};
