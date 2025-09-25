import { Injectable } from '@nestjs/common';
import { Account, AccountType } from './entities/user.entity';

@Injectable({})
export class AccountService {
  private userAccount = new Map<string, Account[]>([
    [
      'ahoj',
      [
        {
          id: '1',
          userId: 'ahoj',
          name: 'Main Checking',
          type: AccountType.CHECKING,
        },
        {
          id: '2',
          userId: 'ahoj',
          name: 'Savings Account',
          type: AccountType.SAVINGS,
        },
      ],
    ],
  ]);
  getAccounts(userId: string) {
    return this.userAccount.get(userId) || [];
  }
}
