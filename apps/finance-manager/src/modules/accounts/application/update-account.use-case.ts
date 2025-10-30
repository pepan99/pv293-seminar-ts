import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateAccountDto } from '../api/dto/accounts-zod.dtos';
import { Account } from '../core/entities/accounts.entity';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class UpdateAccountUseCase {
  constructor(private accountsRepository: AccountsRepository) {}
  async execute(
    id: string,
    updateAccountDto: UpdateAccountDto,
    userId: string,
  ): Promise<Account> {
    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    const updatedAccount = await this.accountsRepository.update(
      id,
      updateAccountDto,
      userId,
    );

    if (!updatedAccount) {
      throw new NotFoundException(`Failed to update account with ID ${id}`);
    }

    return updatedAccount;
  }
}
