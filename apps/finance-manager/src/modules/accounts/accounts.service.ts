import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from './entities/accounts.entity';
import { CreateAccountDto, UpdateAccountDto } from './dtos/accounts-zod.dtos';
import { AccountsRepository } from './repositories/accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async create(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    return this.accountsRepository.create(createAccountDto, userId);
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.accountsRepository.findAll(userId);
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne(id, userId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async update(
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

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.accountsRepository.remove(id, userId);
      if (!result) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Rethrow the "Cannot delete account with transactions" error
      throw error;
    }
  }

  async getAccountBalance(
    id: string,
    userId: string,
  ): Promise<{ balance: number }> {
    return this.accountsRepository.getAccountBalance(id, userId);
  }

  async getBalanceForAllUserAccounts(userId: string) {
    return this.accountsRepository.getBalanceForAllUserAccounts(userId);
  }
}
