import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const accountBaseSchema = z.object({
  id: z.string().uuid(),
  balance: z.number().min(0, 'Balance must be non-negative'),
  accountType: z.enum(['savings', 'investmnet', 'normal']),
  currency: z.enum(['USD', 'EUR', 'CZK']),
  userId: z.string().email('Invalid email format'),
});
const accountSchema = accountBaseSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export class AccountDto extends createZodDto(accountSchema) {}

const createAccountSchema = accountBaseSchema.omit({ id: true });
export class CreateAccountDto extends createZodDto(createAccountSchema) {}

export const AccountSchemas = {
  create: createAccountSchema,
  get: accountSchema,
};
