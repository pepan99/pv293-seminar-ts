export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
};

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export type UserWithoutPassword = Omit<Account, 'password'>;

export type RequestAccountEntity = {
  userId: string;
};
