import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAccountDto } from '../api/dto/accounts-zod.dtos';
import { Account } from '../core/entities/accounts.entity';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class CreateAccountUseCase {
  constructor(private accountsRepository: AccountsRepository) {}
  async execute(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    const newAccount = await this.accountsRepository.create(
      createAccountDto,
      userId,
    );
    return newAccount;
  }
}
