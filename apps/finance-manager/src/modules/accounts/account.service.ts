import { Injectable } from '@nestjs/common';
import { Account, AccountType } from './entities/user.entity';
import { AccountDto } from './dto/zod-dtos';

@Injectable({})
export class AccountService {
  private userAccount = new Map<string, AccountDto[]>([
    [
      'ahoj',
      [
        {
          id: '1',
          userId: 'ahoj',
          name: 'Main Checking',
          type: AccountType.CHECKING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'ahoj',
          name: 'Savings Account',
          type: AccountType.SAVINGS,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    ],
  ]);
  getAccounts(userId?: string): AccountDto[] {
    return this.userAccount.get(userId || '') || [];
  }
  createAccount(data: Account): AccountDto {
    const accounts = this.userAccount.get(data.userId) || [];
    const newAccount = {
      ...data,
      id: (accounts.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    accounts.push(newAccount);
    this.userAccount.set(data.userId, accounts);
    return newAccount;
  }
}
