'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import type { GetRaffleRaffleId200 } from '@ergo-raffle/client';
import { Button, Collapsible, CollapsibleContent, useBreakpoint } from '@ergo-raffle/ui-kit';

import { DonateProvider } from '@/providers';

import { AgreementDialog } from './AgreementDialog';
import { RaffleDonateFallbackAddressDialog } from './RaffleDonateFallbackAddressDialog';
import { RaffleDonateForm } from './RaffleDonateForm';
import { RaffleDonateNetworkSelectDialog } from './RaffleDonateNetworkSelectDialog';

export type RaffleDonateProps = {
  raffle: GetRaffleRaffleId200;
};

export const RaffleDonate = ({ raffle }: RaffleDonateProps) => {
  const { isMobile } = useBreakpoint();
  const [openCollapsible, setOpenCollapsible] = useState<boolean>(false);

  useEffect(() => {
    isMobile && setOpenCollapsible(true);
  }, [isMobile]);

  return (
    <DonateProvider raffle={raffle}>
      <div className="grow w-full relative md:h-66.5 lg:h-auto">
        {raffle.status === 'active' && (
          <Collapsible
            open={openCollapsible}
            onOpenChange={setOpenCollapsible}
            className="relative z-10"
          >
            <CollapsibleContent>
              <RaffleDonateForm raffle={raffle} />
            </CollapsibleContent>
            {!openCollapsible && (
              <Button
                type="button"
                variant="primary"
                className="w-full"
                onClick={() => setOpenCollapsible(true)}
              >
                Donate
              </Button>
            )}
          </Collapsible>
        )}
        <div
          className={`hidden sm:block absolute left-0 z-9 ${raffle.status === 'active' ? 'bottom-0' : 'bottom-1/2 -mb-24'} h-48.5 w-full transition-all transition-duration-300 ${openCollapsible ? 'opacity-0' : 'opacity-100'}`}
        >
          <Image
            src="/illustrations/raffleDonateIllustration.svg"
            alt="Donate"
            className="object-contain object-bottom"
            fill
            sizes="33vw"
          />
        </div>
        <RaffleDonateFallbackAddressDialog />
        <RaffleDonateNetworkSelectDialog raffle={raffle} />
        <AgreementDialog />
      </div>
    </DonateProvider>
  );
};
