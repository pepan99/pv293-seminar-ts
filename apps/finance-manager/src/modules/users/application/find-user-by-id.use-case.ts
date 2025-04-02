import { Injectable, NotFoundException } from '@nestjs/common';
import { UserWithoutPassword } from '../core/entities/user.entity';
import { UsersRepository } from '../infrastructure/repositories/users.repository';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
