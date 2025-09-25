import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/zod-dtos';
import { randomUUID } from 'crypto';

@Injectable()
export class InMemoryAccountsRepository {
  private accounts: Account[] = [];

  create(ownerId: string, accountDto: CreateAccountDto): Account {
    const account: Account = {
      ...accountDto,
      ownerId,
      id: randomUUID(),
      balance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.push(account);
    return account;
  }
}
