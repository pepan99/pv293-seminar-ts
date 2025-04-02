import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { UpdateAccountDto } from '../api/dtos/accounts-zod.dtos';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class UpdateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(
    id: string,
    updateAccountDto: UpdateAccountDto,
    userId: string,
  ): Promise<Account> {
    const updatedAccount = await this.accountsRepository.update(
      id,
      updateAccountDto,
      userId,
    );

    if (!updatedAccount) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return updatedAccount;
  }
}
