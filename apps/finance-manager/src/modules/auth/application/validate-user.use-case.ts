import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../users/infrastructure/repositories/users.repository';
import { UserWithoutPassword } from '../../users/core/entities/user.entity';

@Injectable()
export class ValidateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersRepository.findByEmailWithPassword(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }
}
