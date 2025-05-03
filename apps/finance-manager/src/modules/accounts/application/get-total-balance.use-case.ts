import { Injectable, Inject } from '@nestjs/common';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class GetTotalBalanceUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    return this.accountsRepository.getTotalBalance(userId);
  }
}
