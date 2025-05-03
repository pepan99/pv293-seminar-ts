import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { UpdateAccountCommand } from '../core/commands/account-commands';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class UpdateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(
    id: string,
    command: UpdateAccountCommand,
    userId: string,
  ): Promise<Account> {
    const updatedAccount = await this.accountsRepository.update(
      id,
      command,
      userId,
    );

    if (!updatedAccount) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return updatedAccount;
  }
}
