import { z } from 'zod';

export const CurrencySchema = z.enum([
  'EUR',
  'USD',
  'GBP',
  'CZK',
  'PLN',
  'HUF',
]);

export type Currency = z.infer<typeof CurrencySchema>;
