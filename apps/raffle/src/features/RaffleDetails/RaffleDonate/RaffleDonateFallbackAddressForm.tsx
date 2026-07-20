'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';

import { validateAddress } from '@fleet-sdk/core';
import ReCAPTCHA from 'react-google-recaptcha';

import { Check, Clipboard, Download } from '@ergo-raffle/icons';
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  Field,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Spinner,
  Tooltip,
  Typography,
  toast
} from '@ergo-raffle/ui-kit';

import { useDonate } from '@/hooks';
import { paperWallet } from '@/lib';

export const RaffleDonateFallbackAddressForm = () => {
  const { isSubmitting, siteKey, setRecaptcha, submitDonation } = useDonate();

  const [captchaLoading, setCaptchaLoading] = useState<boolean>(true);
  const [address, setAddress] = useState<string>();
  const [hasError, setHasError] = useState<boolean>();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const onPaperWalletClick = async () => {
    const address = await paperWallet();
    setAddress(address);
  };

  const options = [
    {
      title: 'External Wallet',
      subTitle: 'Recommended',
      description: 'Use an external Ergo wallet like Nautilus to create your own wallet.',
      content: (
        <div>
          <Link
            href="https://ergoplatform.org/en/get-erg/#Wallets"
            target="_blank"
            className="text-primary-1 hover:underline"
          >
            Create a wallet via this external link
          </Link>
          , copy your address, and paste it into the input field below.
        </div>
      )
    },
    {
      title: 'Paper Wallet',
      subTitle: 'Quick and safe',
      description: 'Generate a paper wallet using an external tool.',
      content: (
        <div>
          Follow this{' '}
          <Link
            href="https://ergopaperwallet.org/"
            target="_blank"
            className="text-primary-1 hover:underline"
          >
            external link
          </Link>{' '}
          to create a paper wallet.
        </div>
      )
    },
    {
      title: 'Instant Paper Wallet',
      subTitle: 'Instant',
      description: 'We generate a paper wallet for you directly on this site.',
      content: (
        <div className="flex justify-between items-center">
          Click to generate and download new paper wallet.
          <Tooltip content="Download paper wallet">
            <Button variant="primary-soft" size="icon" onClick={onPaperWalletClick}>
              <Download />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ];

  const handleClick = useCallback(() => {
    const isValid = validateAddress(address || '');

    setHasError(!isValid);

    if (!isValid) return;

    submitDonation(undefined, address || '');
  }, [address, submitDonation]);

  const handleCopy = useCallback(() => {
    if (!address) return;

    navigator.clipboard
      .writeText(address)
      .then(() => {
        toast.success('Address copied to clipboard');
      })
      .catch(() => {
        return;
      });
  }, [address]);

  return (
    <div className="space-y-4">
      <Typography variant="body-button" className="text-success flex items-center mb-2">
        <Check className="size-5 mr-1" /> Connected to Bitcoin
      </Typography>
      <Typography variant="body-md" className="text-gray-2">
        Please add an Ergo wallet address to secure your refunds and rewards before finishing your
        donation. Select an option below to create or connect one.
      </Typography>
      <div className="items-stretch gap-4 hidden md:flex">
        {options.map((option, index) => (
          // biome-ignore lint/a11y: using div as button intentionally
          <div
            onClick={() => setSelectedOptionIndex(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedOptionIndex(index);
              }
            }}
            key={option.title}
            className={cn(
              'flex-1 rounded-md border border-primary-1 text-black-2 p-4 relative cursor-pointer hover:shadow-3',
              selectedOptionIndex === index
                ? 'bg-primary-5  before:absolute before:border-primary-1 before:left-1/2 before:-translate-x-1/2 before:-bottom-2  before:border-r-16 before:border-t-16 before:-rotate-135 before:border-l-transparent before:border-r-transparent before:border-t-black'
                : ''
            )}
          >
            <Typography variant="heading-5">{option.title}</Typography>
            <Typography variant="body-sm" className="text-gray-2">
              {option.subTitle}
            </Typography>
            <Typography variant="subtitle-md">{option.description}</Typography>
          </div>
        ))}
      </div>
      <div className="bg-gray-5 text-gray-5-foreground rounded-md p-4 hidden md:block">
        <Typography variant="body-sm" asChild>
          {options[selectedOptionIndex].content}
        </Typography>
      </div>
      <div className="md:hidden space-y-2">
        {options.map((option, index) => (
          <Collapsible
            key={option.title}
            open={selectedOptionIndex === index}
            onOpenChange={(open) => {
              setSelectedOptionIndex(open ? index : -1);
            }}
          >
            <CollapsibleTrigger asChild>
              <div
                className={cn(
                  'flex-1 rounded-md border border-primary-1 text-black-2 p-4 relative',
                  selectedOptionIndex === index
                    ? 'bg-primary-5  before:absolute before:border-primary-1 before:left-1/2 before:-translate-x-1/2 before:-bottom-1.5  before:border-r-12 before:border-t-12 before:-rotate-135 before:border-l-transparent before:border-r-transparent before:border-t-black'
                    : ''
                )}
              >
                <Typography variant="heading-5">{option.title}</Typography>
                <Typography variant="subtitle-sm">{option.subTitle}</Typography>
                <Typography variant="subtitle-md">{option.description}</Typography>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-gray-5 text-gray-5-foreground rounded-md p-4 mt-2">
              <Typography variant="body-sm" asChild>
                {option.content}
              </Typography>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <Field>
        <FieldLabel>Ergo Address</FieldLabel>
        <InputGroup variant="bordered">
          <InputGroupInput
            value={address}
            onChange={(e) => setAddress(e.target.value?.trim())}
            aria-invalid={hasError}
          />
          <InputGroupAddon align="inline-end">
            <Button variant="plain" size="icon-xs" onClick={handleCopy} disabled={!address}>
              <Clipboard />
            </Button>
          </InputGroupAddon>
        </InputGroup>
        {!!hasError && <FieldError>Address is not valid</FieldError>}
      </Field>
      <div className="flex items-center justify-center h-20">
        <ReCAPTCHA
          sitekey={siteKey ?? ''}
          onChange={(token) => setRecaptcha(token || '')}
          onExpired={() => setRecaptcha('')}
          asyncScriptOnLoad={() => setCaptchaLoading(false)}
        />
      </div>
      <div className="flex items-center justify-center mt-4">
        <Button
          disabled={!address || isSubmitting || captchaLoading}
          type="button"
          className="w-full lg:w-120"
          onClick={handleClick}
          variant="primary"
        >
          {!!(isSubmitting || captchaLoading) && <Spinner />} Submit
        </Button>
      </div>
    </div>
  );
};
