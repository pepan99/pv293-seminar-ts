import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/repositories/users.repository';

@Injectable()
export class RemoveUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.remove(user.id);
  }
}
