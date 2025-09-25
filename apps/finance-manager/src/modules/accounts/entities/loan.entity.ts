import { Currency } from './currency.entity';

export type Loan = {
  id: string;
  accountId: string;
  rentAmount: number;
  currency: Currency;
};
