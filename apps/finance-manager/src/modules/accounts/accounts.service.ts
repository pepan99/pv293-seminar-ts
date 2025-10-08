import {Injectable, NotFoundException} from '@nestjs/common';
import {AccountEntity} from './entities/accounts.entity';
import {CreateAccountDto} from './dtos/accounts-zod.dtos';
import {AccountsRepository} from './repositories/accounts.repository';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async create(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<AccountEntity> {
    return this.accountsRepository.create(createAccountDto, userId);
  }

  async findAll(userId: string): Promise<AccountEntity[]> {
    return (await this.accountsRepository.findAll(userId)).map((account) => ({
      id: account.id,
      name: account.name,
      description: account.description,
      type: account.type,
      currency: account.currency,
      isActive: account.isActive,
      initialBalance: account.initialBalance,
      lastReconciled: account.lastReconciled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      userId: account.userId,
      icon: account.icon,
      color: account.color,
      accountType: account.accountType,
    }));
  }

  async findOne(id: string, userId: string): Promise<AccountEntity> {
    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account.then(
      ({
        id,
        name,
        description,
        type,
        currency,
        isActive,
        initialBalance,
        lastReconciled,
        createdAt,
        updatedAt,
      }) => ({
        id,
        name,
        description,
        type,
        currency,
        isActive,
        initialBalance,
        lastReconciled,
        createdAt,
        updatedAt,
      }),
    );
  }
}
