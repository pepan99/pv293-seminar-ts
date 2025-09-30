export interface Account {
  id: string;
  balance: number;
  accountType: 'savings' | 'investmnet' | 'normal';
  currency: 'USD' | 'EUR' | 'CZK';
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
