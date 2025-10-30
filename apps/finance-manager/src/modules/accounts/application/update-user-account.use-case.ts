import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';
import { Account } from '../core/entities/accounts.entity';
import { UpdateAccountDto } from '../api/dtos/zod-dtos';

@Injectable()
export class UpdateUserAccountUseCase {
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
