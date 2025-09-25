import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const accountBaseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

const accountSchema = accountBaseSchema.extend({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
});

export class AccountDto extends createZodDto(accountSchema) {}

const createAccountSchema = z.object({
  userId: z.string().uuid(),
});
export class CreateAccountDto extends createZodDto(createAccountSchema) {}
