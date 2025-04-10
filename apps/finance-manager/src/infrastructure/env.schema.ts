import { z } from 'zod';

export const appSchema = z.object({
  HOST: z.string().optional().default('0.0.0.0'),
  PORT: z.coerce.number().optional().default(8000),
});
export type AppEnv = z.infer<typeof appSchema>;
