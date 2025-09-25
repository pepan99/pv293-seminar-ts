import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';

@Injectable()
export class InMemoryAccountsRepository {
  private accounts: Account[] = [];

  findAll(): Account[] {
    return this.accounts;
  }
}
