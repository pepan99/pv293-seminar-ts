import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const accountTypeValues = [
  'ASSET',
  'BANK',
  'CASH',
  'CREDIT',
  'INVESTMENT',
  'LIABILITY',
] as const;

const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  accountType: z.enum(accountTypeValues, {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  currency: z.string().default('EUR'),
  notes: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export class CreateAccountDto extends createZodDto(createAccountSchema) {}

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export class UpdateAccountDto extends createZodDto(updateAccountSchema) {}

const reconcileAccountSchema = z.object({
  actualBalance: z.number({
    required_error: 'Actual balance is required',
    invalid_type_error: 'Actual balance must be a number',
  }),
  notes: z.string().optional(),
});

export class ReconcileAccountDto extends createZodDto(reconcileAccountSchema) {}

const systemAccountOperationsSchema = z.object({
  isActive: z.boolean(),
  lastUpdated: z.date(),
  lastReconciled: z.date().optional(),
});

export const AccountSchemas = {
  create: createAccountSchema,
  update: updateAccountSchema,
  reconcile: reconcileAccountSchema,
  systemOperations: systemAccountOperationsSchema,
};
