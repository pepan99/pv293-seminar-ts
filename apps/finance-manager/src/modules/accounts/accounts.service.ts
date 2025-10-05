import {Injectable, NotFoundException} from '@nestjs/common';
import {Account} from './entities/accounts.entity';
import {
  AccountType,
  CreateAccountDto,
  UpdateAccountDto,
} from './dtos/accounts-zod.dtos';
import {AccountsRepository} from './repositories/accounts.repository';

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
    const accounts = await this.accountsRepository.findAll(userId);

    return accounts.map((account) => ({
      ...account,
      accountType: AccountType[account.accountType],
      initialBalance: Number(account.initialBalance),
      isActive: Boolean(account.isActive),
    }));
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return {
      ...account,
      initialBalance: Number(account.initialBalance),
      accountType: AccountType[account.accountType],
      isActive: Boolean(account.isActive),
    };
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
    userId: string,
  ): Promise<Account> {
    const updatedAccount = await this.accountsRepository.update(
      id,
      userId,
      updateAccountDto,
    );

    if (!updatedAccount) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return updatedAccount;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.accountsRepository.remove(id, userId);
  }

  async getAccountBalance(
    id: string,
    userId: string,
  ): Promise<{balance: number}> {
    const balance = await this.accountsRepository.getAccountBalance(id, userId);

    return {balance};
  }
}
