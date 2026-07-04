import { validateAddress } from '@fleet-sdk/core';
import { z } from 'zod';

const raffleSpecificationsSchema = z.object({
  name: z
    .string()
    .nonempty('Cannot be empty')
    .min(2, 'Name is too short')
    .max(50, 'Name is too long'),
  description: z.string({ message: 'Cannot be empty' }).max(2024, 'Description is too long'),
  tags: z.array(z.string()).max(5, 'Cannot be more than 5').optional(),
  images: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        name: z.string()
      })
    )
    .max(4, 'Cannot be more than 4')
    .optional(),
  deadline: z
    .number({
      message: 'Cannot be empty'
    })
    .min(1, 'Deadline must be at least 1')
});

const raffleDonationGoalSchema = (serviceFee?: number) =>
  z.object({
    tokenId: z.string({ message: 'Cannot be empty — please select a token' }),
    count: z.number({ message: 'Cannot be empty' }).min(0, 'Cannot be less than 0'),
    amount: z.number({ message: 'Cannot be empty' }).min(0, 'Cannot be less than 0'),
    address: z
      .string({ message: 'Cannot be empty' })
      .nonempty('Cannot be empty')
      .refine(
        (val) => {
          if (!val) return true;
          try {
            return validateAddress(val);
          } catch {
            return false;
          }
        },
        {
          message: 'Invalid address'
        }
      ),
    missionFund: z
      .number({ message: 'Cannot be empty' })
      .min(0, `Minimum amount: ${serviceFee ? 100 - serviceFee : 100}%`)
      .max(
        serviceFee ? 100 - serviceFee : 100,
        `Maximum amount: ${serviceFee ? 100 - serviceFee : 100}%`
      ),
    winnerPotShare: z
      .number({ message: 'Cannot be empty' })
      .min(0, 'Cannot be less than 0')
      .max(100, 'Cannot be more than 100')
  });

const raffleBasketsSchema = z.object({
  emptyBaskets: z.number({ message: 'Cannot be empty' }),
  details: z.array(
    z.object({
      id: z.string({ message: 'Cannot be empty' }),
      count: z.number({ message: 'Cannot be empty' }).min(1, 'Cannot be less than 1'),
      percent: z
        .number({ message: 'Cannot be empty' })
        .min(0, 'Cannot be less than 0')
        .max(100, 'Cannot be more than 100')
    })
  )
});

const raffleAgreementSchema = z.object({
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms'
  }),
  eligibility: z.boolean().refine((val) => val === true, {
    message: 'Please confirm your eligibility to continue.'
  })
});
export const raffleDonateSchema = z.object({
  tickets: z.number({ message: 'Cannot be empty' }).min(0, 'Cannot be less than 0'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms'
  })
});

export const createRaffleSchema = (serviceFee?: number) =>
  raffleAgreementSchema
    .and(raffleSpecificationsSchema)
    .and(raffleDonationGoalSchema(serviceFee))
    .and(raffleBasketsSchema)
    .superRefine((data, ctx) => {
      if (data.winnerPotShare === 0 && data.emptyBaskets <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'Cannot be less than 1',
          path: ['emptyBaskets']
        });
      }

      if (data.winnerPotShare === 0) return;

      const items = data.details ?? [];

      if (items.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'At least one detail is required',
          path: ['details']
        });

        return;
      }

      if (items.some((i) => i.percent > 100)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Percents cannot be more than 100',
          path: ['details']
        });
      }

      if (items.some((i) => i.count === 0)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Count cannot be less than 1',
          path: ['details']
        });
      }

      const total = items.reduce((sum, item) => sum + item.percent * item.count, 0);

      if (total !== 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'Sum of percentages must equal 100',
          path: ['details']
        });
      }
    });

export const addGiftSchema = z.object({
  winnerIndex: z.number({ message: 'Cannot be empty' }),
  tokens: z
    .array(
      z.object({
        tokenId: z.string({ message: 'Cannot be empty' }),
        amount: z
          .number({
            message: 'Cannot be empty'
          })
          .refine((value) => value > 0, { message: 'Must be more than 0' })
      })
    )
    .min(1, 'At least one asset is required')
    .nonempty('At least one asset is required')
});

export type RaffleSpecificationsForm = z.infer<typeof raffleSpecificationsSchema>;
export type RaffleDonationGoalForm = z.infer<ReturnType<typeof raffleDonationGoalSchema>>;
export type RaffleBasketsForm = z.infer<typeof raffleBasketsSchema>;
export type AddGiftForm = z.infer<typeof addGiftSchema>;
export type RaffleForm = z.infer<ReturnType<typeof createRaffleSchema>>;
export type RaffleDonateForm = z.infer<typeof raffleDonateSchema>;
