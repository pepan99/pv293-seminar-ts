import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAccountsRepository } from '../core/repositories/accounts-repository.interface';

@Injectable()
export class RemoveAccountUseCase {
  constructor(
    @Inject('IAccountsRepository')
    private readonly accountsRepository: IAccountsRepository,
  ) {}

  async execute(id: string, userId: string): Promise<boolean> {
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
}
