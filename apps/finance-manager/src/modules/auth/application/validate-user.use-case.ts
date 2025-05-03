import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUsersRepository } from '../../users/core/repositories/users-repository.interface';

@Injectable()
export class ValidateUserUseCase {
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute(email: string, password: string) {
    const user = await this.usersRepository.findByEmailWithPassword(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }
}
