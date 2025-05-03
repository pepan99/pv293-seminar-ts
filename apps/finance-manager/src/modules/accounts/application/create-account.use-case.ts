import { Injectable } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { CreateAccountCommand } from '../core/commands/account-commands';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class CreateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(
    command: CreateAccountCommand,
    userId: string,
  ): Promise<Account> {
    return this.accountsRepository.create(command, userId);
  }
}
