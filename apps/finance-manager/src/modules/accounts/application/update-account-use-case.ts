import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { UpdateAccountCommand } from '../core/commands/account-commands';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class UpdateAccountUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

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
