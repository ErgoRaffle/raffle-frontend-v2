'use client';

import { useEffect, useMemo, useState } from 'react';

import { useFormContext } from 'react-hook-form';

import type { WalletToken } from '@ergo-raffle/base-wallet';
import type { GetInfoBlockchain200 } from '@ergo-raffle/client';
import { Clipboard, Lock } from '@ergo-raffle/icons';
import {
  Button,
  DistributionBar,
  Field,
  FieldError,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Token,
  Tooltip,
  toast
} from '@ergo-raffle/ui-kit';

import type { RaffleDonationGoalForm } from '@/features/schemas';
import { useWallet } from '@/hooks';

import { FieldTitle } from './FieldTitle';

export type DonationGoalFormProps = {
  handleNext: () => void;
  handleBack: () => void;
  infoBlockchain: GetInfoBlockchain200;
};

export const DonationGoalForm = ({
  handleNext,
  handleBack,
  infoBlockchain
}: DonationGoalFormProps) => {
  const {
    formState: { errors },
    register,
    watch,
    getValues,
    setValue
  } = useFormContext<RaffleDonationGoalForm>();

  const serviceFee = infoBlockchain.fee.service + infoBlockchain.fee.implementer;

  const [tokens, setTokens] = useState<WalletToken[]>([]);

  const wallet = useWallet();

  useEffect(() => {
    wallet.ergo
      ?.fetchTokens()
      .then((tokens) => setTokens(tokens))
      .catch((error) => {
        toast.error('Failed to get wallet.', { errorDetails: error });
      });
  }, [wallet.ergo]);

  const missionFund = watch('missionFund');

  const winnerPotShare = useMemo(() => 100 - (missionFund + serviceFee), [missionFund, serviceFee]);

  useEffect(() => {
    setValue('winnerPotShare', winnerPotShare > 0 ? winnerPotShare : 0, {
      shouldValidate: true,
      shouldDirty: true
    });
  }, [winnerPotShare, setValue]);

  return (
    <div className="space-y-8">
      <div>
        <FieldTitle title="Base Token" />
        <div className="flex flex-col sm:flex-row gap-x-2 gap-y-3">
          <Field className="flex-1">
            <Select
              value={getValues('tokenId') ?? ''}
              onValueChange={(value) =>
                setValue('tokenId', value, { shouldValidate: true, shouldDirty: true })
              }
            >
              <SelectTrigger
                variant="bordered"
                className="mt-7.5"
                disabled={tokens.length === 0}
                aria-invalid={!!errors.tokenId}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tokens.map((token) => (
                    <SelectItem value={token.id} key={token.id} className="p-2">
                      <Token name={token.name} tokenId={token.id.toLowerCase()} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {!!errors.tokenId && <FieldError>{errors.tokenId.message}</FieldError>}
          </Field>
          <Field className="flex-2">
            <FieldLabel>Token ID</FieldLabel>
            <Input variant="bordered" value={watch('tokenId') ?? ''} readOnly />
          </Field>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-x-2 gap-y-3">
        <Field className="flex-1">
          <FieldTitle title="How many tokens to collect?" />
          <Input
            variant="bordered"
            className="max-w-205"
            aria-invalid={!!errors.count}
            {...register('count', { valueAsNumber: true })}
            type="number"
            min={0}
          />
          {!!errors.count && <FieldError>{errors.count.message}</FieldError>}
        </Field>
        <Field className="flex-1">
          <FieldTitle title="Set each Ticket’s Price." />
          <div className="flex items-center gap-x-5">
            <Input
              variant="bordered"
              step="any"
              aria-invalid={!!errors.amount}
              {...register('amount', { valueAsNumber: true })}
              className="max-w-205 grow"
              type="number"
              min={0}
            />
          </div>
          {!!errors.amount && <FieldError>{errors.amount.message}</FieldError>}
        </Field>
      </div>
      <Field>
        <FieldTitle title="Set an Ergo address for the Mission’s Fund." />
        <InputGroup className="lg:max-w-1/2" variant="bordered">
          <InputGroupInput {...register('address')} aria-invalid={!!errors.address} />
          {wallet.ergo?.name === 'Nautilus' && (
            <InputGroupAddon align="inline-end">
              <Tooltip content="Use my connected Ergo wallet address">
                <Button
                  variant="plain"
                  size="icon-xs"
                  onClick={() =>
                    setValue('address', wallet.addresses?.ergo?.main || '', {
                      shouldDirty: true,
                      shouldValidate: true
                    })
                  }
                  type="button"
                >
                  <Clipboard className="size-5" />
                </Button>
              </Tooltip>
            </InputGroupAddon>
          )}
        </InputGroup>
        {!!errors.address && <FieldError>{errors.address.message}</FieldError>}
      </Field>
      <div className="space-y-3">
        <FieldTitle title="Set How to Distribute." />

        <DistributionBar
          service={serviceFee ?? 0}
          winnerPot={errors.winnerPotShare ? undefined : Number(winnerPotShare)}
          missionFund={errors.missionFund ? undefined : Number(missionFund)}
        />
        <div className="flex flex-col sm:flex-row gap-x-2 gap-y-3">
          <div className="sm:w-1/2 md:w-auto flex-1">
            <Field>
              <FieldLabel>Service</FieldLabel>
              <InputGroup variant="bordered">
                <InputGroupInput disabled value={serviceFee} />
                <InputGroupAddon align="inline-end">
                  <Lock className="size-6 text-gray-2" />
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </div>
          <div className="flex flex-col sm:flex-row flex-2 gap-x-2 gap-y-3">
            <Field className="flex-1">
              <FieldLabel>Winners Pot Share</FieldLabel>
              <Input
                variant="bordered"
                type="number"
                min={0}
                max={100 - serviceFee}
                disabled
                {...register('winnerPotShare', { valueAsNumber: true })}
              />
              {!!errors.winnerPotShare && <FieldError>{errors.winnerPotShare.message}</FieldError>}
            </Field>
            <Field className="flex-1">
              <FieldLabel>Mission’s Fund</FieldLabel>
              <Input
                variant="bordered"
                {...register('missionFund', { valueAsNumber: true })}
                aria-invalid={!!errors.missionFund}
              />
              {!!errors.missionFund && <FieldError>{errors.missionFund.message}</FieldError>}
            </Field>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" className="w-32.5 sm:w-70" onClick={handleBack}>
          Back
        </Button>
        <Button type="button" variant="primary" className="w-32.5 sm:w-70" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
