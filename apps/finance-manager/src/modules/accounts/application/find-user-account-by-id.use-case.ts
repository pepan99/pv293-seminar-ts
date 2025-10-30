import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';
import { Account } from '../core/entities/accounts.entity';

@Injectable()
export class FindUserAccountByIdUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}
  async execute(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne(id, userId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }
}
