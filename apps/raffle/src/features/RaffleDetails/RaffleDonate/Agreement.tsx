import { useEffect, useState } from 'react';

import {
  Button,
  Checkbox,
  Field,
  FieldLabel,
  Spinner,
  StyledTextPreview
} from '@ergo-raffle/ui-kit';

import { useDonate, useWallet } from '@/hooks';
import { markdownToHtml } from '@/lib';

export const Agreement = () => {
  const {
    agreementChecked,
    isSubmitting,
    setAgreementChecked,
    setIsFallbackDialogOpen,
    setAgreementDialogOpen,
    setIsSelectNetworkDialogOpen,
    submitDonation
  } = useDonate();

  const wallet = useWallet();

  const [content, setContent] = useState('');

  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  useEffect(() => {
    fetch('/docs/terms.md')
      .then((res) => res.text())
      .then(setContent);
  }, []);

  useEffect(() => {
    setAgreementChecked(false);
  }, [setAgreementChecked]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (scrolledToEnd) return;

    const element = event.currentTarget;

    const reachedEnd = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;

    setScrolledToEnd(reachedEnd);
  };

  return (
    <>
      <div
        className="-mx-4 no-scrollbar max-h-[80vh] lg:max-h-50 overflow-y-auto px-4"
        onScroll={handleScroll}
      >
        <StyledTextPreview
          className="bg-gray-5 p-4 prose prose-neutral max-w-none"
          text={markdownToHtml(content)}
        />
      </div>
      <Field orientation="horizontal" className="mt-4">
        <Checkbox
          checked={agreementChecked}
          disabled={!scrolledToEnd}
          onClick={() => scrolledToEnd && setAgreementChecked(!agreementChecked)}
        />
        <FieldLabel>
          I understand that my donation is permanent, controlled entirely by smart contracts, and
          cannot be refunded if the raffle succeeds.
        </FieldLabel>
      </Field>
      <div className="flex justify-between">
        <Button
          onClick={() => {
            setAgreementChecked(false);
            setAgreementDialogOpen(false);
          }}
          className="min-w-35"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (wallet.selected?.name === 'Nautilus') {
              setIsSelectNetworkDialogOpen(false);
              submitDonation();
            } else {
              setAgreementDialogOpen(false);
              setIsFallbackDialogOpen(true);
            }
          }}
          disabled={!agreementChecked || (wallet.selected?.name === 'Nautilus' && isSubmitting)}
          variant="primary"
          className="min-w-35"
        >
          {wallet.selected?.name === 'Nautilus' ? (
            <>
              {!!isSubmitting && <Spinner />}
              Submit
            </>
          ) : (
            'Ok'
          )}
        </Button>
      </div>
    </>
  );
};
