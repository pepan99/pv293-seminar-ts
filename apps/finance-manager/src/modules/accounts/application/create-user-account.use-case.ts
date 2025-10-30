import { Injectable } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';
import { CreateAccountDto } from '../api/dtos/zod-dtos';
import { Account } from '../core/entities/accounts.entity';

@Injectable()
export class CreateUserAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}
  async execute(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    return this.accountsRepository.create(createAccountDto, userId);
  }
}
