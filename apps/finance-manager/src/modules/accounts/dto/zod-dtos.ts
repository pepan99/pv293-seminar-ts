import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { CurrencySchema } from '../entities/currency.entity';

export const createAccountDtoSchema = z
  .object({
    currency: CurrencySchema,
  })
  .strict();

export class CreateAccountDto extends createZodDto(createAccountDtoSchema) {}
