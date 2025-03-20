import { AccountType } from '../dtos/accounts-zod.dtos';

export type Account = {
  id: string;

  name: string;

  description: string;

  accountType: AccountType;

  initialBalance: number;

  currency: string;

  isActive: boolean;

  lastReconciled: Date;

  icon: string;

  color: string;

  userId: string;

  transactionIds: string[];

  createdAt: Date;

  updatedAt: Date;
};
