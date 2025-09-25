import { Injectable } from '@nestjs/common';
import { InMemoryAccountsRepository } from './repositories/accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: InMemoryAccountsRepository) {}
}
