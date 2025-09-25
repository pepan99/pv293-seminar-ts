import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const accountBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

const accountSchema = accountBaseSchema.extend({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
});

export class AccountDto extends createZodDto(accountSchema) {}

const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});
export class CreateAccountDto extends createZodDto(createAccountSchema) {}
