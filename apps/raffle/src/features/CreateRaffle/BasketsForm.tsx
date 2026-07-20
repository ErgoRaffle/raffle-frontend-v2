import { useEffect } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { Info, Plus, Trash } from '@ergo-raffle/icons';
import {
  BasketStatus,
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Progress,
  Tooltip,
  Typography
} from '@ergo-raffle/ui-kit';

import type { RaffleBasketsForm, RaffleDonationGoalForm } from '../schemas';
import { FieldTitle } from './FieldTitle';

export type BasketsFormProps = {
  handleNext: () => void;
  handleBack: () => void;
};

export const BasketsForm = ({ handleNext, handleBack }: BasketsFormProps) => {
  const {
    formState: { errors },
    register,
    watch,
    control,
    trigger,
    resetField,
    clearErrors
  } = useFormContext<RaffleBasketsForm & RaffleDonationGoalForm>();

  const winnerPotShare = watch('winnerPotShare', 0);

  const details = watch('details');
  const filledSharePercent = details.reduce(
    (sum, item) => sum + (Number(item.percent) || 0) * (Number(item.count) || 0),
    0
  );

  const {
    fields: detailsItems,
    append,
    remove
  } = useFieldArray({
    control,
    name: 'details'
  });

  useEffect(() => {
    if (winnerPotShare === 0) {
      resetField('details');
      clearErrors('details');
    }
  }, [winnerPotShare, clearErrors, resetField]);

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="heading-2">Create Baskets.</Typography>
        <Typography variant="body-md">
          Each winner gets a basket. It can hold part of the raffle share, gifts, both, or none.
        </Typography>
      </div>
      {winnerPotShare !== 0 && (
        <>
          <div className="space-y-3">
            <div>
              <FieldTitle title="Distribute Winners Pot between Share Baskets." />
              <Typography variant="body-md" className="mt-1 mb-3" asChild>
                <div>
                  Winners Pot: {winnerPotShare}% of Total Fund{' '}
                  <Typography asChild variant="body-sm" className="ml-1">
                    <span>{`(${100 - filledSharePercent}% remaining)`}</span>
                  </Typography>
                </div>
              </Typography>
            </div>
            <Progress variant="box" value={filledSharePercent} max={100} />
          </div>
          <Field>
            <FieldLabel>Share Baskets Details</FieldLabel>
            <div
              className="flex items-center flex-wrap border border-gray-4 rounded-lg aria-invalid:border-error pt-2 pr-3 pb-2.5 pl-4 gap-2"
              aria-invalid={!!errors.details}
            >
              {detailsItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center bg-gray-5 text-gray-5-foreground rounded-md px-1.5 py-1 gap-2"
                >
                  <div className="flex items-center gap-0.5">
                    <Input
                      type="number"
                      min={0}
                      size="sm"
                      className="w-9 sm:w-10 pl-0 pr-0 sm:pl-0 sm:pr-0 text-center"
                      {...register(`details.${index}.count`, {
                        setValueAs: (v) => (v === '' ? undefined : Number(v)),
                        onChange: () => trigger('details')
                      })}
                    />
                    <span className="ml-0.5">X</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      size="sm"
                      className="w-9 sm:w-10 pl-0 pr-0 sm:pl-0 sm:pr-0 text-center"
                      {...register(`details.${index}.percent`, {
                        setValueAs: (v) => (v === '' ? undefined : Number(v)),
                        onChange: () => trigger('details')
                      })}
                    />
                    <span className="ml-0.5">%</span>
                  </div>
                  <Button
                    variant="plain"
                    size="icon-xs"
                    onClick={() => remove(index)}
                    type="button"
                  >
                    <Trash className="size-5" />
                  </Button>
                </div>
              ))}
              <Button
                variant="plain"
                size="icon-xs"
                onClick={() =>
                  append({
                    id: crypto.randomUUID(),
                    count: 1,
                    percent: 0
                  })
                }
                type="button"
              >
                <Plus />
              </Button>
            </div>
            {!!errors.details && <FieldError>{errors.details.message}</FieldError>}
          </Field>
        </>
      )}
      <div className="space-y-3">
        <FieldTitle title="Create Empty Baskets." />
        <Field>
          <FieldLabel>Empty Baskets</FieldLabel>
          <InputGroup
            className="max-w-70 w-full"
            variant="bordered"
            aria-invalid={!!errors.emptyBaskets}
          >
            <InputGroupInput
              {...register('emptyBaskets', { valueAsNumber: true })}
              type="number"
              min={0}
            />
            <InputGroupAddon align="inline-start">
              <BasketStatus className="size-6" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Tooltip content="These baskets do NOT include any share of the raffle, but anyone can add gifts to them during the raffle.">
                <Info className="size-6" />
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          {!!errors.emptyBaskets && <FieldError>{errors.emptyBaskets.message}</FieldError>}
        </Field>
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
