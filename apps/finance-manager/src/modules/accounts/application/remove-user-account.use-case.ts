import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class RemoveUserAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}
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
