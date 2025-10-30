import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountsRepository } from '../infrastructure/repositories/accounts.repository';

@Injectable()
export class RemoveAccountUseCase {
  constructor(private accountsRepository: AccountsRepository) {}
  async execute(id: string, userId: string): Promise<void> {
    const account = await this.accountsRepository.findOne(id, userId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    await this.accountsRepository.remove(id, userId);
  }
}
