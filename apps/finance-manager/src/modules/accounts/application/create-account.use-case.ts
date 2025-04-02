import { Injectable } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { CreateAccountDto } from '../api/dtos/accounts-zod.dtos';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class CreateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    return this.accountsRepository.create(createAccountDto, userId);
  }
}
