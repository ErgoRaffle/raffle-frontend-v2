import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useFormContext } from 'react-hook-form';

import type { WalletToken } from '@ergo-raffle/base-wallet';
import type { GetInfoBlockchain200 } from '@ergo-raffle/client';
import {
  BasketStatus,
  Button,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Checkbox,
  Field,
  FieldError,
  FieldLabel,
  Spinner,
  StyledTextPreview,
  Typography,
  toast
} from '@ergo-raffle/ui-kit';

import { useWallet } from '@/hooks';

import type { RaffleForm } from '../schemas';

export type FinishProps = {
  handleBack: () => void;
  infoBlockchain: GetInfoBlockchain200;
};

export const Finish = ({ handleBack, infoBlockchain }: FinishProps) => {
  const serviceFee = infoBlockchain.fee.service + infoBlockchain.fee.implementer;

  const [token, setToken] = useState<WalletToken>();

  const {
    getValues,
    formState: { errors, isSubmitting },
    setValue
  } = useFormContext<RaffleForm>();

  const data = getValues();

  const wallet = useWallet();

  useEffect(() => {
    wallet.ergo
      ?.fetchTokens()
      .then((tokens) => {
        const token = tokens.find((token) => token.id === data.tokenId);
        setToken(token);
      })
      .catch((error) => {
        toast.error('Failed to load token info. Please try again later.', { errorDetails: error });
      });
  }, [data.tokenId, wallet.ergo]);

  return (
    <div className="space-y-8">
      <Typography variant="heading-2">
        Confirm the following information for “{data.name}” raffle.
      </Typography>

      {data.images && data?.images.length > 0 ? (
        <div className="w-51.75 h-41.75 lg:w-127 lg:h-78.75 mx-auto rounded-md overflow-hidden">
          <Carousel>
            <CarouselContent>
              {data.images.map((image) => (
                <CarouselItem key={image.id}>
                  <div className="w-51.75 h-41.75 lg:w-127 lg:h-78.75 relative">
                    {!!image.url && (
                      <Image
                        src={image.url}
                        priority
                        alt={data.name}
                        className="object-cover"
                        fill
                        sizes="50vw"
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {data.images.length > 1 ? (
              <>
                <CarouselDots />
                <CarouselPrevious />
                <CarouselNext />
              </>
            ) : null}
          </Carousel>
        </div>
      ) : null}
      {!!data.description && (
        <div className="space-y-1">
          <Typography variant="body-button">Description:</Typography>
          <StyledTextPreview text={data.description} />
        </div>
      )}
      <div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Raffle deadline:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {data.deadline} blocks
          </Typography>
        </div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Raffle goal:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {data.count} {token?.name}
          </Typography>
        </div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Ticket price:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {data.amount} {token?.name}
          </Typography>
        </div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Mission fund:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {data.missionFund}%
          </Typography>
        </div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Winners Pot:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {data.winnerPotShare}%
          </Typography>
        </div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Protocol fee:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {serviceFee ?? 0}%
          </Typography>
        </div>
        <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
          <Typography variant="body-button">Winners count:</Typography>
          <Typography variant="body-lg" className="text-gray-1">
            {data.details.length + data.emptyBaskets}
          </Typography>
        </div>
      </div>
      <div className="space-y-3">
        <Typography variant="heading-3" className="text-center">
          Baskets
        </Typography>
        <div>
          {!!data.winnerPotShare && (
            <div className="not-last:border-b border-b-black-4 space-y-3 py-3">
              <div className="flex justify-between items-center">
                <Typography variant="body-button" className="flex items-center gap-2">
                  <BasketStatus filled className="size-7" /> Share baskets:
                </Typography>
                <Typography variant="body-lg" className="text-gray-1">
                  {data.details.length}
                </Typography>
              </div>
              <div className="flex gap-2 flex-wrap">
                {data.details.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center bg-gray-5 text-gray-5-foreground rounded-sm px-1.25 py-1 gap-2"
                  >
                    <div className="flex items-center gap-1">
                      <div className="bg-white-1 text-white-2-foreground px-0.5 py-px rounded-xs text-center size-7">
                        {item.count}
                      </div>
                      X
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="bg-white-1 text-white-2-foreground py-0.5 px-px rounded-xs text-center size-7">
                        {item.percent}
                      </div>
                      %
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between not-last:border-b border-b-black-4 py-3">
            <Typography variant="body-button" className="flex items-center gap-2">
              <BasketStatus className="size-7" /> Empty baskets:
            </Typography>
            <Typography variant="body-lg" className="text-gray-1">
              {data.emptyBaskets}
            </Typography>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Typography variant="heading-3" className="text-center">
          Agreement
        </Typography>

        <Field orientation="horizontal">
          <Checkbox
            checked={getValues('terms')}
            onClick={() => {
              setValue('terms', !getValues('terms'), { shouldValidate: true });
            }}
          />
          <div>
            <FieldLabel>
              I have read and agree to the{' '}
              <Link
                href="/privacy-notice"
                className="underline hover:text-secondary-1"
                target="_blank"
              >
                Terms of Service
              </Link>
              .
            </FieldLabel>
            {!!errors.terms && <FieldError>{errors.terms.message}</FieldError>}
          </div>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            checked={getValues('eligibility')}
            onClick={() =>
              setValue('eligibility', !getValues('eligibility'), { shouldValidate: true })
            }
          />
          <div>
            <FieldLabel>
              I confirm that I am not a resident of a country where participation in raffles is
              prohibited.
            </FieldLabel>
            {!!errors.eligibility && <FieldError>{errors.eligibility.message}</FieldError>}
          </div>
        </Field>
      </div>

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" className="w-32.5 sm:w-70" onClick={handleBack}>
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-32.5 sm:w-70"
          disabled={!!Object.keys(errors).length || isSubmitting}
        >
          {!!isSubmitting && <Spinner />}
          Create
        </Button>
      </div>
    </div>
  );
};
