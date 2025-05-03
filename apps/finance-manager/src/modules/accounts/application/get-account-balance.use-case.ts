import { Injectable, Inject } from '@nestjs/common';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class GetAccountBalanceUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(id: string, userId: string): Promise<number> {
    return this.accountsRepository.getBalance(id, userId);
  }
}
