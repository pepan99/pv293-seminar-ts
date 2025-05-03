import { Injectable, Inject } from '@nestjs/common';
import { Account } from '../core/entities/accounts.entity';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class FindAllAccountsUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return this.accountsRepository.findAll(userId);
  }
}
