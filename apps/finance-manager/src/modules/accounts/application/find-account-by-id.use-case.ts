import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class FindAccoutByIdUseCase {
  constructor(private accountsRepository: AccountsRepository) {}
  async execute(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }
}
