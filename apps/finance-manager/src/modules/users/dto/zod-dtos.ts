import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const userBaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

const fetchUserSchema = userBaseSchema.extend({
  roles: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createUserSchema = userBaseSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateUserSchema = userBaseSchema.partial().extend({
  roles: z.array(z.string()).optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export class CreateUserDto extends createZodDto(createUserSchema) {}
export class FetchUserDto extends createZodDto(fetchUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}

export const UserSchemas = {
  create: createUserSchema,
  fetch: fetchUserSchema,
  update: updateUserSchema,
  changePassword: changePasswordSchema,
};
