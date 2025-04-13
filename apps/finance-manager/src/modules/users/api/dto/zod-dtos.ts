import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const userBaseSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
});

const userSchema = userBaseSchema.extend({
    roles: z.array(z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export class UserDto extends createZodDto(userSchema) {}

const createUserSchema = userBaseSchema.omit({ id: true }).extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
});
export class CreateUserDto extends createZodDto(createUserSchema) {}

const updateUserSchema = userBaseSchema.omit({ id: true });
export class UpdateUserDto extends createZodDto(updateUserSchema) {}

const updateUserAdminSchema = userBaseSchema
    .extend({
        roles: z.array(z.string()),
    })
    .omit({ id: true });
export class UpdateUserAdminDto extends createZodDto(updateUserAdminSchema) {}

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
        confirmPassword: z.string().min(8, "Password confirmation is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}

export const UserSchemas = {
    create: createUserSchema,
    get: userSchema,
    update: updateUserSchema,
    updateAdmin: updateUserAdminSchema,
    changePassword: changePasswordSchema,
};
