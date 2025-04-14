import { z } from "zod";
export declare const defaultEnvSchema: z.ZodObject<
  {
    POSTGRES_HOST: z.ZodString;
    POSTGRES_PORT: z.ZodNumber;
    POSTGRES_USER: z.ZodString;
    POSTGRES_PASSWORD: z.ZodString;
    POSTGRES_DB: z.ZodString;
    JWT_SECRET: z.ZodString;
    RABBITMQ_HOST: z.ZodString;
    RABBITMQ_PORT: z.ZodNumber;
    RABBITMQ_USER: z.ZodString;
    RABBITMQ_PASSWORD: z.ZodString;
    RABBITMQ_URI: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    POSTGRES_HOST?: string;
    POSTGRES_PORT?: number;
    POSTGRES_USER?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DB?: string;
    JWT_SECRET?: string;
    RABBITMQ_HOST?: string;
    RABBITMQ_PORT?: number;
    RABBITMQ_USER?: string;
    RABBITMQ_PASSWORD?: string;
    RABBITMQ_URI?: string;
  },
  {
    POSTGRES_HOST?: string;
    POSTGRES_PORT?: number;
    POSTGRES_USER?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DB?: string;
    JWT_SECRET?: string;
    RABBITMQ_HOST?: string;
    RABBITMQ_PORT?: number;
    RABBITMQ_USER?: string;
    RABBITMQ_PASSWORD?: string;
    RABBITMQ_URI?: string;
  }
>;
export type DefaultEnv = z.infer<typeof defaultEnvSchema>;
export declare const appSchema: z.ZodObject<
  {
    HOST: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    PORT: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    JWT_SECRET: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    JWT_SECRET?: string;
    HOST?: string;
    PORT?: number;
  },
  {
    JWT_SECRET?: string;
    HOST?: string;
    PORT?: number;
  }
>;
export type AppEnv = z.infer<typeof appSchema>;
export declare const dbSchema: z.ZodObject<
  {
    POSTGRES_HOST: z.ZodString;
    POSTGRES_PORT: z.ZodNumber;
    POSTGRES_USER: z.ZodString;
    POSTGRES_PASSWORD: z.ZodString;
    POSTGRES_DB: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    POSTGRES_HOST?: string;
    POSTGRES_PORT?: number;
    POSTGRES_USER?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DB?: string;
  },
  {
    POSTGRES_HOST?: string;
    POSTGRES_PORT?: number;
    POSTGRES_USER?: string;
    POSTGRES_PASSWORD?: string;
    POSTGRES_DB?: string;
  }
>;
export type DbEnv = z.infer<typeof dbSchema>;
export declare const rabbitmqSchema: z.ZodObject<
  {
    RABBITMQ_HOST: z.ZodString;
    RABBITMQ_PORT: z.ZodNumber;
    RABBITMQ_USER: z.ZodString;
    RABBITMQ_PASSWORD: z.ZodString;
    RABBITMQ_QUEUE: z.ZodString;
    RABBITMQ_EXCHANGE: z.ZodString;
    RABBITMQ_ROUTING_KEY: z.ZodString;
    RABBITMQ_URI: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    RABBITMQ_HOST?: string;
    RABBITMQ_PORT?: number;
    RABBITMQ_USER?: string;
    RABBITMQ_PASSWORD?: string;
    RABBITMQ_URI?: string;
    RABBITMQ_QUEUE?: string;
    RABBITMQ_EXCHANGE?: string;
    RABBITMQ_ROUTING_KEY?: string;
  },
  {
    RABBITMQ_HOST?: string;
    RABBITMQ_PORT?: number;
    RABBITMQ_USER?: string;
    RABBITMQ_PASSWORD?: string;
    RABBITMQ_URI?: string;
    RABBITMQ_QUEUE?: string;
    RABBITMQ_EXCHANGE?: string;
    RABBITMQ_ROUTING_KEY?: string;
  }
>;
export type RabbitmqEnv = z.infer<typeof rabbitmqSchema>;
