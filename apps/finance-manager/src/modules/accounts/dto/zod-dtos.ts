import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { AccountType } from '../entities/user.entity';

export const accountBaseScheme = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(Object.values(AccountType) as [string, ...string[]]),
});
export const accountScheme = accountBaseScheme.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
});
export class AccountDto extends createZodDto(accountScheme) {}

export class AccountBodyDto extends createZodDto(accountBaseScheme) {}

const createAccountSchema = accountBaseScheme.omit({ id: true });

export const AccountSchemas = {
  create: createAccountSchema,
  get: accountScheme,
};
