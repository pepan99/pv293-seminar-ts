import { Injectable, Inject } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { CreateAccountCommand } from '../core/commands/account-commands';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(
    command: CreateAccountCommand,
    userId: string,
  ): Promise<Account> {
    return this.accountsRepository.create(command, userId);
  }
}
