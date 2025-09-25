import { Currency } from './currency.entity';

export type Account = {
  id: string;
  ownerId: string;
  balance: number;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
