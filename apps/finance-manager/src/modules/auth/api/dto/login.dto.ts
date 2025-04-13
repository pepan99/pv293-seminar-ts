import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email format").default("user@example.com"),
    password: z.string().min(8, "Password must be at least 8 characters").default("password123"),
});

export class LoginDto extends createZodDto(loginSchema) {}
