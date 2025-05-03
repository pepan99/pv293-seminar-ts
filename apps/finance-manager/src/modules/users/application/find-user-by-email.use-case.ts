import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../core/repositories/users-repository.interface';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(
    @Inject('IUsersRepository') private usersRepository: IUsersRepository,
  ) {}

  async execute(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }
}
