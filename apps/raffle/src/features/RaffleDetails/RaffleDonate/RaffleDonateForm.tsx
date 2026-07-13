'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { GetRaffleRaffleId200 } from '@ergo-raffle/client';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Spinner,
  Typography
} from '@ergo-raffle/ui-kit';

import { useDonate } from '@/hooks';
import { getDecimalString } from '@/lib';

import { RaffleDonateMessage } from './RaffleDonateMessage';

export type RaffleDonateFormProps = {
  raffle: GetRaffleRaffleId200;
};

export const RaffleDonateForm = ({ raffle }: RaffleDonateFormProps) => {
  const { donateForm, onDonateFormSubmit, donateTransactionId, isSubmitting, isLoading } =
    useDonate();

  const {
    handleSubmit,
    formState: { errors },
    register,
    getValues,
    setValue
  } = donateForm;

  return (
    <form onSubmit={handleSubmit(onDonateFormSubmit)}>
      <Card className="mb-2 py-8" shadow>
        <CardContent className="flex items-stretch">
          {donateTransactionId ? (
            <RaffleDonateMessage transactionId={donateTransactionId} />
          ) : (
            <>
              <div className="space-y-4 grow xl:max-w-1/2">
                <div>
                  <Typography variant="heading-4" className="text-black-1 mb-1">
                    How many Tickets to Get?
                  </Typography>
                  {raffle.token ? (
                    <Typography variant="subtitle-md" className="text-gray-2">
                      each Ticket = {getDecimalString(raffle.ticketPrice, raffle.token.decimals)}{' '}
                      {raffle.token.name}
                    </Typography>
                  ) : null}
                </div>
                <Field>
                  <Input
                    variant="bordered"
                    type="number"
                    min={1}
                    aria-invalid={!!errors.tickets}
                    {...register('tickets', { valueAsNumber: true })}
                  />
                  {!!errors.tickets && <FieldError>{errors.tickets.message}</FieldError>}
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id="checkout-terms"
                    checked={getValues('terms')}
                    onClick={() => {
                      setValue('terms', !getValues('terms'), { shouldValidate: true });
                    }}
                  />
                  <div>
                    <FieldLabel htmlFor="checkout-terms" className="whitespace-nowrap">
                      I Agree to the{' '}
                      <Link href="/terms" className="underline whitespace-nowrap" target="_blank">
                        Terms of Service
                      </Link>
                      &
                      <Link
                        href="/privacy-notice"
                        className="underline whitespace-nowrap"
                        target="_blank"
                      >
                        Privacy Notice
                      </Link>
                    </FieldLabel>
                    {!!errors.terms && <FieldError>{errors.terms.message}</FieldError>}
                  </div>
                </Field>
              </div>
              <div className="hidden sm:block relative w-1/2">
                <Image
                  src="/illustrations/raffleDonateFormIllustration.svg"
                  alt="Donate"
                  fill
                  className="object-contain"
                  sizes="33vw"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={Boolean(donateTransactionId) || isLoading || isSubmitting}
      >
        {(!!isLoading || isSubmitting) && <Spinner className="size-7" />}
        {isSubmitting ? 'Submitting' : 'Donate'}
      </Button>
    </form>
  );
};
