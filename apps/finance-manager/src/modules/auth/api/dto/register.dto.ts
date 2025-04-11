import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const userBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

const createUserSchema = userBaseSchema.omit({ id: true }).extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export class RegisterUserDto extends createZodDto(createUserSchema) {}
