import { Injectable } from '@nestjs/common';
import { InMemoryAccountsRepository } from './repositories/accounts.repository';
import { CreateAccountDto } from './dto/zod-dtos';

@Injectable()
export class AccountsService {
  constructor(private accountsRepository: InMemoryAccountsRepository) {}

  async create(userId: string, dto: CreateAccountDto) {
    return this.accountsRepository.create(userId, dto);
  }
}
