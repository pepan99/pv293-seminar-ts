import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define AccountType enum
export enum AccountType {
  CASH = 'CASH',
  BANK = 'BANK',
  CREDIT = 'CREDIT',
  INVESTMENT = 'INVESTMENT',
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
}

// Schema for creating a new account (user input fields only)
const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  accountType: z.nativeEnum(AccountType, {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  currency: z.string().default('EUR'),
  notes: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export class CreateAccountDto extends createZodDto(createAccountSchema) {}

// Schema for updating an account (only fields users should be able to modify)
const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export class UpdateAccountDto extends createZodDto(updateAccountSchema) {}

// Schema for reconciling an account
const reconcileAccountSchema = z.object({
  actualBalance: z.number({
    required_error: 'Actual balance is required',
    invalid_type_error: 'Actual balance must be a number',
  }),
  notes: z.string().optional(),
});

export class ReconcileAccountDto extends createZodDto(reconcileAccountSchema) {}

// System operations schema (admin/system use only, not for regular user input)
const systemAccountOperationsSchema = z.object({
  isActive: z.boolean(),
  lastUpdated: z.date(),
  lastReconciled: z.date().optional(),
});

// Export schemas for reuse
export const AccountSchemas = {
  create: createAccountSchema,
  update: updateAccountSchema,
  reconcile: reconcileAccountSchema,
  systemOperations: systemAccountOperationsSchema,
};
