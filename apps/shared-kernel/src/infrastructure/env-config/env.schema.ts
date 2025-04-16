import { z } from "zod";

export const defaultEnvSchema = z.object({
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  JWT_SECRET: z.string(),
  RABBITMQ_HOST: z.string(),
  RABBITMQ_PORT: z.coerce.number(),
  RABBITMQ_USER: z.string(),
  RABBITMQ_PASSWORD: z.string(),
  RABBITMQ_URI: z.string(),
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

export const rabbitmqSchema = z.object({
  RABBITMQ_HOST: z.string(),
  RABBITMQ_PORT: z.coerce.number(),
  RABBITMQ_USER: z.string(),
  RABBITMQ_PASSWORD: z.string(),
  RABBITMQ_URI: z.string(),
});

export type RabbitmqEnv = z.infer<typeof rabbitmqSchema>;
