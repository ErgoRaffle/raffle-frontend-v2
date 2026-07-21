'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { Card, CardContent, Stepper, Typography, toast } from '@ergo-raffle/ui-kit';

import { createRaffleSchema, type RaffleForm } from '@/features/schemas';
import { createRaffle } from '@/features/services';
import { useInfoBlockchain, useWallet } from '@/hooks';
import { getTxURL, htmlToMarkdown } from '@/lib';

import { BasketsForm } from './BasketsForm';
import { CreateRaffleSkeleton } from './CreateRaffleSkeleton';
import { DonationGoalForm } from './DonationGoalForm';
import { Finish } from './Finish';
import { NoActiveWallet } from './NoActiveWallet';
import { SpecificationsForm } from './SpecificationsForm';

export const CreateRaffle = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const wallet = useWallet();

  const infoBlockchain = useInfoBlockchain();
  const raffleSchema = createRaffleSchema(
    infoBlockchain.data
      ? infoBlockchain.data.fee.implementer + infoBlockchain.data.fee.service
      : undefined
  );
  const form = useForm<RaffleForm>({
    resolver: zodResolver(raffleSchema),
    shouldUnregister: false,
    mode: 'onChange',
    defaultValues: {
      details: [],
      emptyBaskets: 0,
      terms: false,
      eligibility: false,
      missionFund: 0
    }
  });

  const handleNext = async () => {
    const fields = steps[activeStepIndex].fields;
    if (fields?.length) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    setActiveStepIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStepIndex((prev) => prev - 1);
  };

  const resetForm = () => {
    form.reset();
    setActiveStepIndex(0);
    typeof window !== 'undefined' && window.scrollTo(0, 0);
  };

  const onSubmit = async (data: RaffleForm) => {
    try {
      const { description, ...formData } = data;
      const markdownDescription = htmlToMarkdown(description);
      const tx = await createRaffle({ ...formData, description: markdownDescription }, wallet);
      toast.success('Raffle created successfully!', {
        description: (
          <>
            Click{' '}
            <Link className="text-primary-1" href={getTxURL(tx) || ''} target="_blank">
              here
            </Link>{' '}
            to see details.
          </>
        )
      });
      resetForm();
    } catch (error) {
      toast.error('Failed to create raffle. Please try again later.', { errorDetails: error });
    }
  };

  if (infoBlockchain.isLoading) return <CreateRaffleSkeleton />;
  if (!infoBlockchain.data) return null;

  const hasNoActiveWallet = wallet.ergo?.name !== 'Nautilus';

  const steps = [
    {
      title: 'Specifications',
      content: <SpecificationsForm handleNext={handleNext} />,
      fields: ['name', 'description', 'tags', 'deadline', 'images'] as const
    },
    {
      title: 'Donation Goal',
      content: (
        <DonationGoalForm
          handleNext={handleNext}
          handleBack={handleBack}
          infoBlockchain={infoBlockchain.data}
        />
      ),
      fields: ['tokenId', 'count', 'amount', 'missionFund', 'winnerPotShare', 'address'] as const
    },
    {
      title: 'Baskets',
      content: <BasketsForm handleNext={handleNext} handleBack={handleBack} />,
      fields: ['emptyBaskets', 'details'] as const
    },
    {
      title: 'Overview & Agreement',
      content: <Finish handleBack={handleBack} infoBlockchain={infoBlockchain.data} />
    }
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-5 py-3.5 mb-7">
        <Image
          src="/illustrations/createRaffleIllustration.svg"
          alt="Create Raffle"
          width={500}
          height={190}
          className="hidden sm:block"
        />
        {!hasNoActiveWallet && (
          <>
            <Typography variant="heading-1">Ready to create a new raffle?</Typography>
            <Stepper
              steps={steps.map((s) => s.title)}
              activeStepIndex={activeStepIndex}
              disabled={hasNoActiveWallet}
            />
          </>
        )}
      </div>
      {hasNoActiveWallet ? (
        <NoActiveWallet />
      ) : (
        <Card className="py-7">
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mx-auto max-w-7xl">{steps[activeStepIndex]?.content}</div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      )}
    </>
  );
};
