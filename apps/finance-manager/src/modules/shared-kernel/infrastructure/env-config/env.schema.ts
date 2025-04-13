import { z } from "zod";

export const defaultEnvSchema = z.object({
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
    JWT_SECRET: z.string(),
    ADMIN_EMAIL: z.string(),
    ADMIN_PASSWORD: z.string(),
    ADMIN_NAME: z.string(),
});
export type DefaultEnv = z.infer<typeof defaultEnvSchema>;

export const appSchema = z.object({
    HOST: z.string().optional().default("0.0.0.0"),
    PORT: z.coerce.number().optional().default(8000),
    JWT_SECRET: z.string(),
});

export type AppEnv = z.infer<typeof appSchema>;

export const dbSchema = z.object({
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.coerce.number(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),
});

export type DbEnv = z.infer<typeof dbSchema>;
