import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class FindOneAccountUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne(id, userId);

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }
}
