import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const accountBaseSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  balance: z.number().min(0, 'Balance cannot be negative'),
  // createdAt: z.date(),
  // updatedAt: z.date(),
});

export class CreateAccountDto extends createZodDto(accountBaseSchema) {}
