import { Injectable, NotFoundException } from '@nestjs/common';
import { UserWithoutPassword } from '../core/entities/user.entity';
import { UsersRepository } from '../infrastructure/repositories/users.repository';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(email: string): Promise<UserWithoutPassword> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }
}
